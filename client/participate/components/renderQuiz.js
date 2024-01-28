/** @param {QuizData} quiz */
export default function (quiz) {
    const questions = [];
    let i = 0;

    for (const q of quiz.questions) {
        const questionID = `q-${i}`;

        if (q.type == "select") {
            const answers = [];
            let j = 0;

            for (const answer of q.answers) {
                const answerID = `q-${i}-${j}`;
                answers.push(`
                    <div class="answer radio-answer">
                        <input type="radio" id="${answerID}" name="${questionID}" value="${answer}"><label for="${answerID}">${answer}</label>
                    </div>
                `);

                j++;
            }

            questions.push(`
                <form class="question">
                    <p class="question-title">${q.question}</p>
                    <div class="answers">
                        ${answers.join("")}
                    </div>
                </form>
            `);
        } else if (q.type == "input") {
            questions.push(`
                <div class="question">
                    <p class="question-title">${q.question}</p>
                    <div class="answer input-answer">
                        <input type="text" id="${questionID}" placeholder="Deine Antwort"/>
                    </div>    
                </div>
            `);
        }

        i++;
    }

    return `
        <div class="quiz">
            <h1>${quiz.title}</h1>
            <div class="questions">
                ${questions.join("")}
            </div>
            <button onclick="finishPoll()">Fertig</button>
        </div>
    `;
}
