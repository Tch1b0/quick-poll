import { create } from "../../lib/dom.js";

export class ChartDisplay {
    /** @type {HTMLElement} */
    #root;

    /** @type {QuizData} */
    #quiz;

    /** @type {Chart[]} */
    #charts = [];

    /** @type {Map<string, string[]>} */
    #infos = new Map();

    /** @type {(() => void)[]} */
    #deferredCallbacksQueue = [];

    /** @type {Array} */
    #infoQueue = [];

    /** @type {HTMLButtonElement} */
    #freezeBtn;

    /** @type {boolean} */
    #frozen = false;

    /**
     * @param {HTMLElement} root
     * @param {QuizData} quiz
     */
    constructor(root, quiz) {
        this.#root = root;
        this.#quiz = quiz;

        // execute asynchronously, to ensure that the main thread is not blocked
        (async () => {
            this.#root.appendChild(this.#setup());
            this.#executeDeferred();
        })();
    }

    /**
     * setup the chart-elements
     * @returns {HTMLDivElement} a div element containing the charts
     */
    #setup() {
        const charts = [];

        let i = 0;
        for (const q of this.#quiz.data.questions) {
            const ID = `chart-q-${i}`;

            const canvas = create("canvas");
            canvas.id = ID;

            this.#callDeferred(() => {
                this.#charts.push(
                    new Chart(canvas, {
                        type: "pie",
                        data: {
                            labels: q.answers,
                            datasets: [
                                {
                                    label: "# of Votes",
                                    data: [],
                                },
                            ],
                        },
                        options: {
                            plugins: {
                                colors: {
                                    enabled: true,
                                    forceOverride: true,
                                },
                            },
                        },
                    })
                );
            });

            charts.push(canvas);
            i++;
        }

        // create the div containing the charts
        const div = create("div");
        div.classList.add("charts");
        div.append(
            ...charts.map((c, i) => {
                /**
                 * <div>
                 *     <h2 class="data-question-title">{TITLE}</h2>
                 *     <canvas ...></canvas>
                 * </div>
                 */

                // create div containing the title and chart
                const d = create("div");
                // create the title
                const h2 = create("h2");
                h2.classList.add("data-question-title");
                h2.innerText = this.#quiz.data.questions[i].question;

                // add the title and the chart to the div
                d.appendChild(h2);
                d.appendChild(c);
                return d;
            })
        );
        const freezeBtn = create("button");
        freezeBtn.innerText = "Einfrieren";
        freezeBtn.addEventListener("click", () => {
            this.#freezeBtnClick();
        });
        this.#freezeBtn = freezeBtn;

        div.appendChild(freezeBtn);

        return div;
    }

    /**
     * adds a callback to the queue
     * @param {() => void} callback
     */
    #callDeferred(callback) {
        // append the callback to the queue, to be executed later on
        this.#deferredCallbacksQueue.push(callback);
    }

    /**
     * executes all deferred callbacks and clears the queue
     */
    #executeDeferred() {
        // execute all callbacks in the queue
        for (const callback of this.#deferredCallbacksQueue) {
            callback();
        }
        this.#deferredCallbacksQueue = [];
    }

    /**
     * @param {{id: string, answers: string[]}} info
     */
    update(info) {
        if (this.#frozen) {
            this.#infoQueue.push(info);
            return;
        }
        this.#infos.set(info.id, info.answers);

        this.#renderCharts();
    }

    /**
     * renders/updates the charts using the received user info
     */
    #renderCharts() {
        const answers = [];
        for (const [_, value] of this.#infos) {
            if (!value) continue;
            answers.push(value);
        }

        for (let i = 0; i < this.#quiz.data.questions.length; i++) {
            const q = this.#quiz.data.questions[i];
            let data = [];
            if (q.type === "select") {
                data = this.#sumUserSelectionAnswers(
                    this.#quiz.data.questions[i].answers,
                    answers.map((v) => v[i])
                );
            } else if (q.type === "input") {
                const res = this.#sumUserInputAnswers(answers.map((v) => v[i]));
                this.#charts[i].data.labels = res.labels;
                data = res.data;
            }
            this.#charts[i].data.datasets[0].data = data;
            this.#charts[i].update();
        }
    }

    /**
     * sums up the number of times each answer was selected by users
     * @param {string[]} possibleAnswers the array of possible answers to a question
     * @param {string[]} userAnswers the array of answers selected by all users for the question
     * @returns {number[]} an array of the sum of selections for each answer
     */
    #sumUserSelectionAnswers(possibleAnswers, userAnswers) {
        const data = [];
        for (const a of possibleAnswers) {
            const sum = userAnswers
                .map((x) => (x === a ? 1 : 0))
                .reduce((a, b) => a + b, 0);
            data.push(sum);
        }
        return data;
    }

    /**
     * sums up the number of times each answer was entered by users
     * @param {string[]} allAnswers
     * @returns {{labels: string[], data: number[]}}
     */
    #sumUserInputAnswers(allAnswers) {
        const uniqueAnswers = Array.from(new Set(allAnswers).values());
        const data = [];
        for (const answ of uniqueAnswers) {
            data.push(allAnswers.filter((x) => x === answ).length);
        }

        return {
            labels: uniqueAnswers,
            data: data,
        };
    }

    #freezeBtnClick() {
        this.#frozen = !this.#frozen;
        this.#freezeBtn.innerText = this.#frozen ? "Auftauen" : "Einfrieren";

        if (!this.#frozen) {
            for (const i of this.#infoQueue) {
                this.update(i);
            }
            this.#infoQueue = [];
        }
    }
}
