import { DEBUG } from "../constants.js";
import { newWSConnection } from "../lib/connection.js";
import { $ } from "../lib/dom.js";
import { ChartDisplay } from "./components/chartDisplay.js";

// UI object used for mutating/navigating the page (simulating one-page-application)
const UI = {
    root: $("root"),
    preStartElements: $("pre-start"),

    startQuiz() {
        this.root.removeChild(this.preStartElements);
    },
};

/** @type {ChartDisplay} */
let chartDisplay = null;

/**
 * id of the session to be created
 * TODO: make random or user input
 * @type {string}
 */
const ID = "1234";

// create the QR code, directing to the active participate page
new QRCode($("qrcode"), `${window.location.origin}/participate#id=${ID}`);

// connect to the server / create the session
const ws = newWSConnection(undefined, "host", ID);

ws.onopen = (_) => {};

ws.onmessage = (ev) => {
    /**
     * @type {Action}
     */
    const action = JSON.parse(ev.data);

    // handle action
    switch (action.type) {
        // noop on idle, as it was sent from here
        case "idle":
            return;

        // noop on quiz, as it was sent from here
        case "quiz": {
            return;
        }

        // update charts using the received user info
        case "info": {
            for (const data of action.data) {
                chartDisplay.update(data);
            }
        }
    }
};

ws.onclose = (_) => {
    alert("WebSocket disconnected");
};

$("btn").onclick = (_) => {
    const raw = {
        type: "quiz",
        data: {
            title: "Test",
            questions: [
                {
                    question: "What is the capital of France?",
                    type: "select",
                    answers: ["Paris", "Berlin", "Madrid", "Rome"],
                },
                {
                    question: "What is the capital of Germany?",
                    type: "input",
                    answers: [],
                },
            ],
        },
    };
    const data = JSON.stringify(raw);
    chartDisplay = new ChartDisplay($("root"), raw);
    UI.startQuiz();

    if (ws.readyState === ws.OPEN) {
        ws.send(data);
    } else {
        alert("No connection => No quiz start");
    }
};
