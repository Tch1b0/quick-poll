import URLParams from "../lib/URLParams.js";
import { newWSConnection } from "../lib/connection.js";
import { $ } from "../lib/dom.js";
import { IS_DEBUG } from "../lib/environment.js";
import { ChartDisplay } from "./components/chartDisplay.js";

const params = URLParams(window.location.href);
const sessionID = params.get("id");

if (!sessionID) {
    window.location.href = "../";
    throw new Error("No id provided");
}

// UI object used for mutating/navigating the page (simulating one-page-application)
const UI = {
    root: $("root"),
    preStartElements: $("pre-start"),
    loadingElements: $("loadingElements"),

    displayStart() {
        this.loadingElements.style.display = "none";
        this.preStartElements.style.display = "block";
    },

    startQuiz() {
        this.root.removeChild(this.preStartElements);
    },
};

/** @type {ChartDisplay} */
let chartDisplay = null;

const joinURL = `${window.location.origin}/participate#id=${sessionID}`;
$("weburl").innerText = joinURL;

const qrSize = Math.min(window.innerWidth, window.innerHeight) * 0.75;

// create the QR code, directing to the active participate page
new QRCode($("qrcode"), {
    text: joinURL,
    width: qrSize,
    height: qrSize,
    colorDark: "#ff00d4",
    colorLight: "#050612",
    correctLevel: QRCode.CorrectLevel.H,
});

// connect to the server / create the session
const ws = newWSConnection(undefined, "host", sessionID);

ws.onopen = (_) => {
    UI.displayStart();
};

ws.onmessage = (ev) => {
    /** @type {Action} */
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
            return;
        }

        case "state": {
            $("clientCount").innerText = String(action.data.clientCount);
            return;
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
