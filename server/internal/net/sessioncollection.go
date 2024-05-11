package net

import (
	"math/rand"
	"time"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

type SessionCollection struct {
	Sessions []*Session
}

func (sc *SessionCollection) Add(s *Session) {
	sc.Sessions = append(sc.Sessions, s)
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
