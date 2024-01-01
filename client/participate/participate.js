import { DEBUG } from "../constants.js";
import URLParams from "../lib/URLParams.js";
import { newWSConnection } from "../lib/connection.js";
import { $ } from "../lib/dom.js";
import renderIdle from "./components/renderIdle.js";
import renderQuiz from "./components/renderQuiz.js";

const params = URLParams();
const sessionId = params.get("id");
let answers = [];

// redirect to home if no session id is provided
if (!sessionId) {
    window.location.href = "../";
    throw new Error("No id provided");
}

// UI object used for mutating/navigating the page (simulating one-page-application)
const UI = {
    root: $("root"),

    /**
     * @param {Action?} action
     */
    loadState(action) {
        if (action.type === "idle") {
            this.renderIdle();
        } else if (action.type === "quiz") {
            this.renderQuiz(action.data);
        }
    },

    renderIdle() {
        this.root.innerHTML = renderIdle();
    },

    /** @param {QuizData} quiz */
    renderQuiz(quiz) {
        this.root.innerHTML = renderQuiz(quiz);

        for (const input of this.root.querySelectorAll("input")) {
            const t = input.getAttribute("type");
            if (t === "radio") {
                // submit state on selection
                input.addEventListener("change", handleInput);
            } else if (t === "text") {
                // submit state on deselection
                input.addEventListener("blur", handleInput);
            }
        }
    },
};

// connect to session
const ws = newWSConnection(undefined, "client", sessionId);

ws.onopen = (_) => {
    // notify user on connection
    UI.renderIdle();
};

ws.onmessage = (e) => {
    /** @type {Action} */
    const action = JSON.parse(e.data);
    if (action.type === "quiz") {
        // init answers with an empty strings sequence of the length of the questions
        answers = action.data.questions.map(() => "");
    }
    UI.loadState(action);
};

ws.onclose = (_) => {};

function handleInput(ev) {
    const id = Number(ev.target.id.split("-")[1]);
    answers[id] = ev.target.value;
    informServer();
}

function informServer() {
    ws.send(JSON.stringify(answers));
}

if (DEBUG) {
    // sample quiz, used for debugging
    UI.renderQuiz({
        title: "Test",
        questions: [
            {
                question: "Wie heißt du?",
                type: "input",
                answers: null,
            },
            {
                question: "Wer war Jeffrey Epstein?",
                type: "select",
                answers: [
                    "Jeffrey Epstein",
                    "Jeffrey Epstein 2",
                    "Jeffrey Epstein 3",
                ],
            },
            {
                question: "What is the capital of France?",
                type: "select",
                answers: ["Paris", "Berlin", "Madrid", "Rome"],
            },
            {
                question: "Solve 3 x 5:",
                type: "input",
                answers: null,
            },
            {
                question: "Which planet is known as the Red Planet?",
                type: "select",
                answers: ["Earth", "Mars", "Jupiter", "Venus"],
            },
            {
                question: "What is the chemical symbol for water?",
                type: "input",
                answers: null,
            },
        ],
    });
}
