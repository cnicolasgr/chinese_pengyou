import { Prompt } from "../teacher/prompts";
import { TeacherService } from "../teacher/teacher.service";
import { Exercise } from "./exercise";

/**
 * An multi-answer quizz exercise
 */
export class ExerciseForm extends Exercise{

    // answers index selected by the user
    selectedAnswers: { [questionId: string] : number[] } = {};
    questions: ExerciseFormModel = {};

    constructor(teacherService: TeacherService)
    {
        super(teacherService);
        this.exerciseType = "readingComprehension"
    }
    
    override get jsonExercise(): ExerciseFormModel
    {
        return this._jsonExercise;
    }
    
    public override parseJsonExercise(): void {
        this.questions = this.jsonExercise;
        for (const [key, value] of Object.entries(this.jsonExercise))
        {
            this.selectedAnswers[key] = [];
        }
    }

    /**
     * Check if the answers were correct for a given question
     * @param key the key of the question
     * @returns true if the submitted answers match the correct answers
     */
    public checkAnswer(key: string)
    {
        let correctAnswers = new Set<number>(this.questions[key].answer)
        let submittedAnswers = new Set<number>(this.selectedAnswers[key])

        // check that every submitted answers are in the correct answers set and vice versa
        let areSetsEqual = (a: Set<number>, b: Set<number>) => a.size === b.size && [...a].every(value => b.has(value));
        return areSetsEqual(correctAnswers, submittedAnswers);
    }

    /**
     * Retry the exercise (clear entries and allow resubmition)
     */
    public retry()
    {
        for (const [key, value] of Object.entries(this.jsonExercise))
        {
            this.selectedAnswers[key] = [];
        }
        this.isCorrected = false;
    }
}

interface ExerciseFormModel
{
    [questionId: string]: 
    {
        question: string,
        choices: string[],
        answer: number[],
        comment: string
    }; 
}