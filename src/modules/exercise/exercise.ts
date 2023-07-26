import { Prompt } from "../teacher/prompts";
import { TeacherService } from "../teacher/teacher.service";

/**
 * A class defining an exercise
 */
export abstract class Exercise {

    public isCorrected: boolean;

    protected _exerciseType: ExerciseType;
    protected _jsonExercise: any;
    protected _isReadyForDisplay: boolean = false;
    protected _teacherService: TeacherService;
    
    constructor(teacherService: TeacherService) 
    {
        this._teacherService = teacherService;
    }

    set exerciseType(exerciseType: ExerciseType) 
    {
        this._exerciseType = exerciseType;
    }

    get exerciseType(): ExerciseType
    {
        return this._exerciseType;
    }

    get jsonExercise(): any
    {
        return this._jsonExercise;
    }

    set isReadyForDisplay(value: boolean) 
    {
        this._isReadyForDisplay = value;
    }

    get isReadyForDisplay(): boolean
    {
        return this._isReadyForDisplay;
    }

    /**
     * Parse the JSON comming from the GPT model
     */
    abstract parseJsonExercise(): void;

    /**
     * Restart the exercise
     */
    abstract retry(): void;

    /**
     * Request an exercise to the GPT model
     */
    public async requestNew()
    {
        // make this generic once different type of exercises exist
        await this._teacherService.askQuestion(Prompt.createFormExercise(), true);
        this._jsonExercise = JSON.parse(this._teacherService.getTextAnswer())
        this.parseJsonExercise();
        this.isReadyForDisplay = true;
    }

    /**
     * Submit the student answer
     */
    submitAnswer(): void
    {
        this.isCorrected = true;
    }
}

export type ExerciseType = "readingComprehension" | "oralComprehension";