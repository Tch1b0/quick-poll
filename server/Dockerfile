FROM golang:alpine

WORKDIR /app

COPY ./**/* /app/
COPY ./* /app/

RUN go build -o server ./main.go

CMD [ "./server" ]
