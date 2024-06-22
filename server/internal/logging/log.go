package logging

import (
	"fmt"
	"log/slog"
)

type Logger struct {
}

func (l Logger) Info(process string, msg string) {
	slog.Info(fmt.Sprintf("[%s] %s", process, msg))
}

var logger *Logger

func init() {
	logger = &Logger{}
}

func GetLogger() *Logger {
	return logger
}
