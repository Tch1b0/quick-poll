/** 
  @typedef {
    "idle" | "quiz"
  } QuizType
  
  @typedef {{
    question: string,
    type: QuizType,
    answers: string[]
  }} Question

  @typedef {{
    title: string,
    questions: Question[]
  }} QuizData

  @typedef {{
    type: QuizType,
    data: QuizData?
  }} Action
*/
