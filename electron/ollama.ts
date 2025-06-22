import { z } from 'zod'
import { getUserInterests, getUserNotInterests } from './UserPreferences';
import { TOPIC_KEYWORDS } from './types';

const Importance = z.object({
    importance: z.number(),
});



function createPrompt(title: string, summary: string, date: string, userInterests: string[], userNotInterests: string[]): string {
    const interestKeywords = userInterests.flatMap(interest =>
        TOPIC_KEYWORDS[interest as keyof typeof TOPIC_KEYWORDS] || []
    );

    const notInterestKeywords = userNotInterests.flatMap(notInterest =>
        TOPIC_KEYWORDS[notInterest as keyof typeof TOPIC_KEYWORDS] || []
    );

    let prompt = `Rate the importance of this news story from 0 to 100: "${title}", """${summary}""". Take into account that it was published on: ${date}.`;

    if(interestKeywords.length > 0) {
        prompt += ` Important news stories are related to: ${interestKeywords.join(', ')}.`;
    }
    if(notInterestKeywords.length > 0) {
        prompt += ` News stories that are NOT important are related to: ${notInterestKeywords.join(', ')}.`;
    }

    return prompt;
}

export async function callOllama(title: string, summary: string, date: string): Promise<number> {
    if(!title || !summary) {
        return -1;
    }

    try {
        const apiResponse = await fetch('https://ai.hackclub.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an API that returns a JSON object with a single key "importance" which is a number from 0 to 100. Do not return any other text or formatting.'
                    },
                    {
                        role: 'user',
                        content: createPrompt(title, summary, date, getUserInterests(), getUserNotInterests())
                    }
                ],
                response_format: {
                    type: "json_object"
                },
                format: {
                    type: 'object',
                    properties: {
                        'importance': {
                            type: 'number'
                        }
                    },
                    required: 'importance'
                }
            }),
        });

        if(!apiResponse.ok) {
            console.error(`API call failed: ${apiResponse.status} ${apiResponse.statusText}`);
            const errorBody = await apiResponse.text();
            console.error('Error body:', errorBody);
            return -1;
        }

        const responseData = await apiResponse.json();const messageContent = responseData.choices[0].message.content;

        const importance = Importance.parse(JSON.parse(messageContent));
        console.log(`${title}`);
        console.log(importance);
        return importance.importance;
    } catch (error) {
        console.error('Failed to call API or parse response:', error);
        return -1;
    }
}
