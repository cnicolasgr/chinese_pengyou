import { Subject } from 'rxjs';
import credentials from '../../../credentials.json';
import { Injectable } from '@angular/core';
import { Prompt, openaiMessage } from './prompts';
const { Configuration, OpenAIApi } = require("openai");

@Injectable()
export class TeacherService
{
    private openai: any;
    isProcessing = false;
    public context: openaiMessage[] = [Prompt.teacherBehavior];
    public lastChatCompletion: any;

    constructor()
    {
      const configuration = new Configuration({
        apiKey: credentials.OPENAI_ACCESS_TOKEN,
        basePath: credentials.OPENAI_BASE_PATH
      });

      // Setting the User-Agent in the front end throw an error
      delete configuration.baseOptions.headers['User-Agent'];

      this.openai = new OpenAIApi(configuration);      
    }


    /**
     * Prompt chat GPT
     * @param question the prompt submitted to the model
     */
    public async askQuestion(question: openaiMessage, includeContext=true)
    {
      this.isProcessing = true;
      console.info("Prompt to GPT laoshi: " + question);

      let answer = undefined;
      let message = [question];
      this.context.push(question)
      if (includeContext)
      {
        message = this.context;
      }

      try 
      {
        const chatCompletion = await this.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: message,
            // stream not supported yet... wait for release 4
            stream: false
        });
        console.log(chatCompletion.data);

        this.lastChatCompletion = chatCompletion.data;

        // save chatGPT answer into the context
        this.context.push({role: 'assistant', content: this.getTextAnswer()})
        answer =  chatCompletion.data;
      } 
      catch (error: any) 
      {
        if (error.response) 
        {
          console.log(error.response.status);
          console.log(error.response.data);
        } 
        else 
        {
          console.log(error.message);
        }
      }

      this.isProcessing = false;
      return answer;
    }

    /**
     * Get the text output of the last chat completion
     * @returns The string containing the proper model answer
     */
    public getTextAnswer(): string
    {
      return this.lastChatCompletion.choices[0].message.content;
    }
}