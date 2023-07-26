/**
 * Defines the prompts sended to the GPT model
 */
export class Prompt
{
    static teacherBehavior = 
    {
        role: "system",
        content: `You are a helpful chinese teacher whose mother tong is chinese. You can speak English from time to time but you want to prioritize speaking in chinese except
        when you are explaining a word too difficult for the level of the student.
        `
    }

    static story(theme: string, level: string, cardsToUse: string[]): openaiMessage
    {
        let content = `The student you are adressing to has a ${level} level.

            - Create an exercise text about the following theme: ${theme}.
            - The text can include for example articles, reports, messages, short stories, emails, adverts, personal messages, tips, notices or reviews...
            - The story shall be written using simplified mandarin characters.
            - Text shall be interesting, coherent and its length shall match the student level.
            `;

        if (cardsToUse.length > 0)
        {
            content += `- The student wants to review some characters therefore they must absolutely be used in the story. Here are these characters : ${cardsToUse}`;
        }

        content += 'Double check that the points mentionned above are correct and write only the text.'

        return(
        {
            role: "system",
            content: content
        });
    }

    // TODO SEND THE ENGLISH VERSION ALONGSIDE
    static createFormExercise()
    {
        let content = `Create a reading comprehension quizz exercise on the previous text you created. 
        - Questions shall focus on the theme of the text and on the potential characters being reviewed.
        - Questions shall evaluate text understanding of the student.
        - Questions shall be adapted to the student level (you can use english if you deem that the student level is too low).
        - Questions may have multiple answers.
        - Your response shall be in JSON syntax structured like the following example:
            {
                "question 1":
                {
                    "question": "#replace here with the first question#",
                    "choices": ["#the first choice#", "#the second choice#"],
                    "answer": [#indexes of the correct choices#],
                    "comment": #explain how you find the correct answer#
                },
                "question 2":
                {
                    "question": "#replace here with the second question#",
                    "choices": ["#the first choice#", "#the second choice#"],
                    "answer": [#indexes of the correct choices#],
                    "comment": #explain how you find the correct answer#
                }
            }
            This is just an example, you shall ask at least 3 questions up to 10 questions with a minimum of 3 choices for each question.
        - Double check that your answers are correct and that the correct JSON structure respect point 2.
            `;
        return(
            {
                role: "system",
                content: content
            });
    }
}

export type openaiMessage = 
{
  role: string,
  content: string
}