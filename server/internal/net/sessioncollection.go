package net

import (
	"fmt"
	"math/rand"

	"github.com/Tch1b0/quick-poll/internal/logging"
)

type SessionCollection struct {
	Sessions []*Session
}

func (sc *SessionCollection) Add(s *Session) {
	sc.Sessions = append(sc.Sessions, s)
	sc.Cleanup()

	sc.Info(fmt.Sprintf("added session #%s", s.Id))
}

func (sc SessionCollection) GetById(id string) *Session {
	for _, s := range sc.Sessions {
		if s.Id == id {
			return s
		}
	}

	return nil
}

func (sc SessionCollection) GenerateUniqueID() string {
	n := 5
	v := genId(n)
	for sc.GetById(v) != nil {
		v = genId(n)
	}

	return v
}

func (sc *SessionCollection) Cleanup() {
	nSessions := []*Session{}
	for _, s := range sc.Sessions {
		if s.Active {
			nSessions = append(nSessions, s)
		}
	}
	sc.Sessions = nSessions

	sc.Info("ran cleanup")
}

func (sc SessionCollection) Info(msg string) {
	logging.GetLogger().Info("SessionCollection", msg)
}

func genId(n int) string {
	s := ""
	for i := 0; i < n; i++ {
		s += string(rune(rand.Int()%25 + 65))
	}

	return s
}

func NewSessionCollection() SessionCollection {
	return SessionCollection{
		Sessions: []*Session{},
	}
}
