package main

import (
	"fmt"
	"net/http"

	"github.com/Tch1b0/quick-poll/internal/net"
	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func main() {
	initSentry()

	s := gin.Default()
	sc := net.NewSessionCollection()

	s.Use(CORSMiddleware())
	s.Use(sentrygin.New(sentrygin.Options{}))

	s.GET("/", func(c *gin.Context) {
		c.String(200, "ok")
	})

	s.GET("/host/id/:id", func(c *gin.Context) {
		id := c.Param("id")

		if sc.GetById(id) != nil {
			c.String(400, "ID already in use")
			return
		}

		ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			c.String(http.StatusInternalServerError, "Failed to upgrade to websocket")
			return
		}
		host := net.NewHost(ws)
		s := net.NewSession(id)
		s.AddHost(&host)
		sc.Add(s)
	})

	s.GET("/host", func(c *gin.Context) {
		id := sc.GenerateUniqueID()

		ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			c.String(http.StatusInternalServerError, "Failed to upgrade to websocket")
			return
		}
		host := net.NewHost(ws)
		s := net.NewSession(id)
		s.AddHost(&host)
		sc.Add(s)
		s.SendHosts(net.Action{
			Type: "session-created",
			Data: map[string]string{
				"id": id,
			},
		})
	})

	s.GET("/client/:id", func(c *gin.Context) {
		id := c.Param("id")

		s := sc.GetById(id)
		if s == nil {
			c.String(404, "ID not found")
			return
		}

		ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			c.String(http.StatusInternalServerError, "Failed to upgrade to websocket")
			return
		}

		cl := net.NewClient(ws)
		ws.SetCloseHandler(func(code int, text string) error {
			cl.HandleClose()
			ws.CloseHandler()(code, text)
			return err
		})
		s.AddClient(&cl)
	})

	s.Run(":8080")
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func initSentry() {
	if err := sentry.Init(sentry.ClientOptions{
		Dsn: "https://3688852d9c6785720a7b2012f072bec5@o4508681578741760.ingest.de.sentry.io/4508681704374352",
		// Set TracesSampleRate to 1.0 to capture 100%
		// of transactions for tracing.
		// We recommend adjusting this value in production,
		EnableTracing:    true,
		TracesSampleRate: 1.0,
	}); err != nil {
		fmt.Printf("Sentry initialization failed: %v\n", err)
	}
}
