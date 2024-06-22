import { getURLParams } from "../lib/URLParams.js";
import { newWSConnection } from "../lib/connection.js";
import { $ } from "../lib/dom.js";
import { ChartDisplay } from "./components/chartDisplay.js";

// const params = getURLParams(window.location.href);
// const sessionID = params.get("id");

// if (!sessionID) {
//     window.location.href = "../";
//     throw new Error("No id provided");
// }

let sessionID;
let joinURL;
let qr;

function createQR(el) {
    const qrSize = Math.min(window.innerWidth, window.innerHeight) * 0.5;

    // create the QR code, directing to the active participate page
    qr = new QRCode(el, {
        text: joinURL,
        width: qrSize,
        height: qrSize,
        colorDark: "snow",
        colorLight: "#050612",
        correctLevel: QRCode.CorrectLevel.H,
    });
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
        createQR($("qrcode-2"));
    },
};

/** @type {ChartDisplay} */
let chartDisplay = null;

function onSessionCreated() {
    joinURL = `${window.location.origin}/participate#id=${sessionID}`;
    $("weburl").innerText = joinURL;

    createQR($("qrcode"));
}

// connect to the server / create the session
const ws = newWSConnection(undefined, "host");

ws.onopen = (_) => {
    UI.displayStart();
    console.log("WebSocket successfully connected");
};

ws.onmessage = (ev) => {
    /** @type {Action} */
    const action = JSON.parse(ev.data);

    // handle action
    switch (action.type) {
        case "session-created": {
            sessionID = action.data["id"];
            console.log(sessionID);
            onSessionCreated();
        }
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
    const closeAction = {
        type: "close",
    };
    ws.send(JSON.stringify(closeAction));

    alert("WebSocket disconnected");
    console.error("something went wrong with the websocket");
};

/**
 * @returns {QuizData?}
 */
function parseFormQuiz() {
    let question, type, answers;
    const logInvalidForm = () =>
        console.info("invalid poll form, defaulting to example poll");

    try {
        question = $("pollTitle").value;
        type = $("pollType").value;
        answers = $("pollAnswers")
            .value.split(",")
            .map((v) => v.trim());
    } catch {
        logInvalidForm();
        return null;
    }

    if (!question || !type || !answers) {
        logInvalidForm();
        return null;
    }

    return {
        title: "Umfrage",
        questions: [
            {
                question,
                type,
                answers,
            },
        ],
    };
}

$("btn").addEventListener("click", (_) => {
    const rawPoll = {
        type: "quiz",
        data: parseFormQuiz() ?? {
            title: "Beispielumfrage",
            questions: [
                {
                    question:
                        "Welche Programmiersprache fällt dir am leichtesten?",
                    type: "select",
                    answers: ["Java", "JavaScript", "C++"],
                },
                {
                    question: "Welches Betriebssystem hat dein Handy?",
                    type: "select",
                    answers: ["Android", "iOS"],
                },
                {
                    question: "Wie heißt dein Lieblingsspiel?",
                    type: "input",
                    answers: [],
                },
                {
                    question:
                        "Welche Social Media Plattform nutzt du am meisten?",
                    type: "select",
                    answers: [
                        "Instagram",
                        "YouTube",
                        "TikTok",
                        "Reddit",
                        "Andere",
                    ],
                },
            ],
        },
    };

    const poll = JSON.stringify(rawPoll);
    chartDisplay = new ChartDisplay($("root"), rawPoll);
    UI.startQuiz();

    if (ws.readyState === ws.OPEN) {
        ws.send(poll);
    } else {
        alert("No connection => No quiz start");
    }
});
