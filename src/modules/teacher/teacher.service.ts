import { Subject } from 'rxjs';
import credentials from '../../../credentials.json';
import { Injectable } from '@angular/core';
const { Configuration, OpenAIApi } = require("openai");

@Injectable()
export class TeacherService
{

    public talk$: Subject<any> = new Subject<any>();
    private openai: any;
    isProcessing = false;

    constructor()
    {
      const configuration = new Configuration({
        apiKey: credentials.OPENAI_ACCESS_TOKEN,
        basePath: credentials.OPENAI_BASE_PATH
      });

      this.openai = new OpenAIApi(configuration);      
    }


    /**
     * Prompt chat GPT and register new tokens to this.talk$
     * @param question the prompt submitted to the model
     */
    public async askQuestion(question: string)
    {
      this.isProcessing = true;
      console.info("Prompt to GPT laoshi: " + question);

      try {
        const chatCompletion = await this.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{role: "system", content: question}],
            // steam not supported yet... wait for release 4
            stream: false
        });
        console.log(chatCompletion.data);
        this.talk$.next(chatCompletion.data);
     
      } catch (error: any) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
      }

      this.isProcessing = false;
    }
}