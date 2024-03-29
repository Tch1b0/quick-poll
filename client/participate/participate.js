import { getURLParams } from "../lib/URLParams.js";
import { isDebugServerAvailable, newWSConnection } from "../lib/connection.js";
import { $, $$ } from "../lib/dom.js";
import { IS_DEBUG } from "../lib/environment.js";
import renderIdle from "./components/renderIdle.js";
import renderQuiz from "./components/renderQuiz.js";
import renderDone from "./components/renderDone.js";

const params = getURLParams();
const sessionID = params.get("id");
let answers = [];

// redirect to home if no session id is provided
if (!sessionID) {
    window.location.href = "../";
    throw new Error("No id provided");
}

const isFirstTimeAccess =
    localStorage.getItem(`joined-session-${sessionID}`) === null;

if (!isFirstTimeAccess) {
    window.location.href = "../";
    throw new Error(`User already participated in session "${sessionID}"`);
}

// UI object used for mutating/navigating the page (simulating one-page-application)
const UI = {
    root: $("root"),

    /** @param {Action} action */
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

        for (const input of $$("input")) {
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

    renderDone() {
        this.root.innerHTML = renderDone();
    },
};

// connect to session
const ws = newWSConnection(undefined, "client", sessionID);

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
    localStorage.setItem(`joined-session-${sessionID}`, true);

    console.log(`sent: "${JSON.stringify(answers)}"`);
    ws.send(JSON.stringify(answers));
}

window.finishPoll = () => {
    UI.renderDone();
};

(async () => {
    if (!IS_DEBUG || (await isDebugServerAvailable())) {
        return;
    }

    alert(
        "You are in debug mode => the following poll is not live\n\nSwitch to qp.johannespour.de for full functionality "
    );

    // sample quiz, used for debugging
    UI.renderQuiz({
        title: "Test",
        questions: [
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
})();
