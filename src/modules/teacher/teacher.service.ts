import { Subject } from 'rxjs';
import credentials from '../../../credentials.json';
import { ChatGPTUnofficialProxyAPI, ChatMessage } from 'chatgpt'
import { Injectable } from '@angular/core';

@Injectable()
export class TeacherService
{

    public talk$: Subject<ChatMessage> = new Subject<ChatMessage>();
    private apiReverseProxyUrl = 'https://ai.fakeopen.com/api/conversation';
    private api: ChatGPTUnofficialProxyAPI;
    isProcessing: boolean = false;

    constructor()
    {
        this.api = new ChatGPTUnofficialProxyAPI({
            accessToken: credentials.OPENAI_ACCESS_TOKEN,
            apiReverseProxyUrl: this.apiReverseProxyUrl
        })
    }


    /**
     * Prompt chat GPT and register new tokens to this.talk$
     * @param question the prompt submitted to the model
     */
    public async askQuestion(question: string)
    {
        this.isProcessing = true;
        console.info("Prompt to GPT laoshi: " + question);
        const res = await this.api.sendMessage(question, {
            onProgress: (partialResponse) =>
            {
                this.talk$.next(partialResponse);
            }
        });
        console.info("GPT laoshi answer:" + res);
        this.isProcessing = false;
    }
}