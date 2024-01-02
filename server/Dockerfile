FROM golang:alpine

WORKDIR /app

COPY ./**/* /app/

RUN go mod download
RUN go build -o server ./main.go

CMD [ "./server" ]
