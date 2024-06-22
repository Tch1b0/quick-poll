package net

import (
	"fmt"

	"github.com/Tch1b0/quick-poll/internal/logging"
	"github.com/Tch1b0/quick-poll/internal/quiz"
)

type Session struct {
	Id          string
	Active      bool
	Hosts       []*Host
	Clients     []*Client
	CurrentQuiz *quiz.Data
}

func (s *Session) AddClient(c *Client) {
	s.Clients = append(s.Clients, c)

	go s.ClientListenLoop(c)
	s.SendHostCurrentState()

	// if quiz already started, send it to the new client
	if s.CurrentQuiz != nil {
		c.Ws.WriteJSON(Action{
			Type: "quiz",
			Data: s.CurrentQuiz,
		})
	}

	s.sessionLog("added client")
}

func (s *Session) ClientListenLoop(c *Client) {
	var err error = nil

	for s.Active && err == nil {
		var data []string
		err = c.Ws.ReadJSON(&data)

		if err != nil {
			fmt.Println(err)
			continue
		}

		c.QuizAnswers = data
		s.SendHosts(Action{
			Type: "info",
			Data: []ClientInfo{c.Info()},
		})
	}
}

func (s *Session) AddHost(h *Host) {
	s.Hosts = append(s.Hosts, h)

	h.Ws.WriteJSON(Action{
		Type: "quiz",
		Data: s.CurrentQuiz,
	})

	allClientInfos := []ClientInfo{}
	for _, c := range s.Clients {
		allClientInfos = append(allClientInfos, c.Info())
	}

	h.Ws.WriteJSON(Action{
		Type: "info",
		Data: allClientInfos,
	})

	go s.HostListenLoop(h)

	s.sessionLog("added host")
}

func (s *Session) HostListenLoop(h *Host) {
	var err error = nil

	for s.Active && err == nil {
		action := Action{}
		err = h.Ws.ReadJSON(&action)

		if err == nil {
			err = s.processAction(action)
			fmt.Println(err)
		}
	}

	s.removeHost(h)
}

func (s *Session) processAction(a Action) error {
	if a.Type == "idle" {
		s.StartIdle()
		return nil
	} else if a.Type == "quiz" {
		quiz, err := quiz.DataFromPartialParsedData(a.Data)

		if err != nil {
			return err
		}

		s.StartQuiz(quiz)
		return nil
	} else if a.Type == "close" {
		s.Active = false
	}

	return fmt.Errorf("invalid action type \"%s\"", a.Type)
}

func (s *Session) StartIdle() {
	s.SendAll(Action{
		Type: "idle",
	})

	s.sessionLog("idle action is being performed")
}

func (s *Session) StartQuiz(quiz quiz.Data) {
	s.CurrentQuiz = &quiz
	s.SendAll(Action{
		Type: "quiz",
		Data: s.CurrentQuiz,
	})

	s.sessionLog("quiz was started")
}

func (s Session) SendClients(v any) {
	for _, c := range s.Clients {
		err := c.Ws.WriteJSON(v)

		// kick the client if the message fails, as the client is most likely not in the session anymore
		if err != nil {
			defer s.removeClient(c)
			fmt.Println(err)
		}
	}

	s.sessionLog("a message was sent to clients")
}

func (s Session) SendHosts(v any) {
	for _, h := range s.Hosts {
		err := h.Ws.WriteJSON(v)

		// kick the host if the message fails, as the host is most likely not in the session anymore
		if err != nil {
			defer s.removeHost(h)
			fmt.Println(err)
		}
	}

	s.sessionLog("a message was sent to host")
}

func (s Session) SendAll(v any) {
	s.SendClients(v)
	s.SendHosts(v)

	msg, ok := v.(string)
	if ok {
		s.sessionLog(fmt.Sprintf("sent message to all: %s", msg))
	} else {
		s.sessionLog("a message was sent to all")
	}
}

func (s Session) SendHostCurrentState() {
	s.SendHosts(Action{
		Type: "state",
		Data: map[string]any{
			"clientCount": len(s.Clients),
		},
	})

	s.sessionLog("current state updated with hosts")
}

func (s *Session) removeClient(selectedClient *Client) {
	newClients := []*Client{}
	for _, c := range s.Clients {
		if c.Ws == selectedClient.Ws {
			continue
		}
		newClients = append(newClients, c)
	}

	s.Clients = newClients
	s.SendHostCurrentState()

	s.sessionLog("client removed")
}

func (s *Session) removeHost(selectedHost *Host) {
	newHosts := []*Host{}
	for _, c := range s.Hosts {
		if c.Ws == selectedHost.Ws {
			continue
		}
		newHosts = append(newHosts, c)
	}

	s.Hosts = newHosts

	if len(s.Hosts) == 0 {
		s.Active = false
	}

	s.sessionLog("host removed")
}

func (s *Session) EndSession() {
	s.Active = false

	s.Hosts[0].Ws.Close()
	for _, c := range s.Clients {
		c.Ws.Close()
	}

	s.sessionLog("session ended")
}

func (s Session) sessionLog(msg string) {
	logging.GetLogger().Info(fmt.Sprintf("Session#%s", s.Id), msg)
}

func NewSession(id string) *Session {
	return &Session{
		Id:          id,
		Active:      true,
		Hosts:       []*Host{},
		Clients:     []*Client{},
		CurrentQuiz: nil,
	}
}
