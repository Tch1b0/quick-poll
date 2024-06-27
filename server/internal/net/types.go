package net

import "github.com/google/uuid"

type Client struct {
	Ws           WebSocket
	ID           string
	QuizAnswers  []string
	closeHandler func()
}

func (c *Client) SetCloseHandler(handler func()) {
	c.closeHandler = handler
}

func (c Client) HandleClose() {
	c.closeHandler()
}

func (c Client) Info() ClientInfo {
	return ClientInfo{
		ID:      c.ID,
		Answers: c.QuizAnswers,
	}
}

type ClientInfo struct {
	ID      string   `json:"id"`
	Answers []string `json:"answers"`
}

func NewClient(ws WebSocket) Client {
	return Client{
		Ws:          ws,
		ID:          uuid.New().String(),
		QuizAnswers: []string{},
	}
}

type Host struct {
	Ws WebSocket
}

func NewHost(ws WebSocket) Host {
	return Host{
		Ws: ws,
	}
}

type Action struct {
	Type string `json:"type"`
	Data any    `json:"data,omitempty"`
}

func (a Action) Index() int {
	return int(a.Data.(float64))
}
