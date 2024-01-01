package quiz

import (
	"fmt"
)

type Question struct {
	Question string   `json:"question"`
	Type     string   `json:"type"`
	Answers  []string `json:"answers"`
}

type Data struct {
	Title     string     `json:"title"`
	Questions []Question `json:"questions"`
}

func DataFromPartialParsedData(partial any) (Data, error) {
	p, ok := partial.(map[string]any)
	if !ok {
		return Data{}, fmt.Errorf("invalid data %v", partial)
	}

	title, ok := p["title"].(string)
	if !ok {
		return Data{}, fmt.Errorf("invalid title %v", p["title"])
	}

	rawQuestions, ok := p["questions"].([]any)
	if !ok {
		return Data{}, fmt.Errorf("invalid questions %v", p["questions"])
	}

	questions := []Question{}

	for _, q := range rawQuestions {
		question, ok := q.(map[string]any)
		if !ok {
			return Data{}, fmt.Errorf("invalid question %v", q)
		}

		q, ok1 := question["question"].(string)
		t, ok2 := question["type"].(string)
		a, ok3 := question["answers"].([]any)
		if !(ok1 && ok2 && ok3) {
			return Data{}, fmt.Errorf("invalid question %v", question)
		}

		questions = append(questions, Question{
			Question: q,
			Type:     t,
			Answers:  anySliceToStrSlice(a),
		})
	}

	return Data{
		Title:     title,
		Questions: questions,
	}, nil
}

func anySliceToStrSlice(in []any) []string {
	out := make([]string, len(in))
	for i, v := range in {
		out[i] = v.(string)
	}
	return out
}
