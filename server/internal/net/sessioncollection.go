package net

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

func NewSessionCollection() SessionCollection {
	return SessionCollection{
		Sessions: []*Session{},
	}
}
