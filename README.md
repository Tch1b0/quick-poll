<div align="center">
    <img src="./client/icons/icon-256.png" alt="logo">
    <h1>Quick Poll</h1>
    <img alt="GitHub License" src="https://img.shields.io/github/license/Tch1b0/quick-poll" /> <img alt="GitHub issues" src="https://img.shields.io/github/issues/Tch1b0/quick-poll" />
    <br>
    <p>quickly take a poll</p>

</div>

## About

Quick Poll is using [WebSockets](https://de.wikipedia.org/wiki/WebSocket) to
immediately transmit and evaluate the entries of the poll

## Host

### Requirements

-   git
-   docker (and docker-compose)

### Setup

```sh
$ git clone https://github.com/Tch1b0/quick-poll
$ cd ./quick-poll
$ docker-compose build && docker-compose up -d
```

The client webserver is now exposed on port `5030`,
and the API on port `5031`
