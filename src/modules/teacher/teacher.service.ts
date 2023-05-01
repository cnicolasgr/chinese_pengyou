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

    constructor()
    {
        this.api = new ChatGPTUnofficialProxyAPI({
            accessToken: credentials.OPENAI_ACCESS_TOKEN,
            apiReverseProxyUrl: this.apiReverseProxyUrl
        })
    }


    public async askQuestion(question: string)
    {
        await this.api.sendMessage(question, {
            onProgress: (partialResponse) =>
            {
                this.talk$.next(partialResponse);
            }
        })
    }
}