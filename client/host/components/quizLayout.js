export class QuizLayout {
    /** @type {HTMLElement} */
    root;
    /** @type {HTMLElement[]} */
    questions;

    constructor(root) {
        this.root = root;
        this.questions = [];
    }

    addQuestion() {
        const div = document.createElement("div");
        div.className = "question";
        const titleInput = document.createElement("input");
        titleInput.id = "pollTitle";
        titleInput.type = "text";
        titleInput.placeholder = "Frage";

        const answerType = this.#createInputTypeSelection();

        const answerInput = document.createElement("input");
        answerInput.id = "pollAnswers";
        answerInput.type = "text";
        answerInput.placeholder = "Antwort1, Antwort2, ...";

        div.appendChild(titleInput);
        div.appendChild(answerType);
        div.appendChild(answerInput);

        answerType.addEventListener("change", () => {
            if (answerType.selectedIndex == 0) {
                answerInput.style.display = "block";
            } else {
                answerInput.style.display = "none";
            }
        });

        this.questions.push(div);
        console.log(div);
        this.root.appendChild(div);
    }

    #createInputTypeSelection() {
        const answerType = document.createElement("select");
        answerType.id = "pollType";
        const opt1 = document.createElement("option");
        opt1.value = "select";
        opt1.text = "Auswahl";
        opt1.selected = true;

        const opt2 = document.createElement("option");
        opt2.value = "input";
        opt2.text = "Eingabe";
        opt2.selected = false;

        answerType.appendChild(opt1);
        answerType.appendChild(opt2);

        return answerType;
    }

    removeQuestion() {
        this.root.removeChild(this.questions.pop());
    }

    toJSON() {
        return this.questions.map((v) => {
            return {
                question: v.children.item(0).value,
                type: v.children.item(1).value,
                answers: v.children
                    .item(2)
                    .value.split(",")
                    .map((x) => x.trim()),
            };
        });
    }
}
