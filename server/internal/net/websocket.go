package net

type WebSocket interface {
	ReadJSON(v any) error
	WriteJSON(v any) error
}
