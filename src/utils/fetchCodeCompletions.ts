import fetch from "node-fetch";
import { URL } from "url";
// import * as openai from 'openai';

export type FetchCodeCompletions = {
    completions: Array<string>
}

export function fetchLineCompletionTexts(prompt: string, API_BASE: string, API_KEY: string, BOOK_ID: string): Promise<FetchCodeCompletions> {
    console.log(API_BASE);
    const API_URL = new URL(`${API_BASE}/book/${BOOK_ID}`);

    API_URL.searchParams.append("prompt", prompt);

    const headers = { "Authorization": `Bearer ${API_KEY}` };
    return new Promise((resolve, reject) => {
        return fetch(API_URL, {
            method: "GET",
            headers: headers
        })
            .then(res => res.json())
            .then(json => {
                if ( (json?.code === 0) && (json?.data?.results !== undefined) ) {
                    const completions = Array<string>();

                    for (let i = 0; i < json.data.results.length; i++) {
                        const completion = json.data.results[i].content.trimStart();
                        if (completion.trim() === "") continue;
                        if (completion === "No results found.") {
                            completions.push(
                                ""
                            );
                            continue;
                        }
                        const prmptIndex = completion.indexOf(prompt);
                        if (prmptIndex !== -1) {
                            completions.push(
                                completion.slice(prmptIndex + prompt.length, -1)
                            );
                        }
                        else {
                            completions.push(
                                completion
                            );
                        }

                    }
                    console.log(completions);
                    resolve({ completions });
                }
                else {
                    console.log(json);
                    // throw new Error(json["error"]);
                }
            })
            .catch(err => reject(err));
    });
}


// export function fetchCodeCompletionTexts(prompt: string, fileName: string, MODEL_NAME: string, API_KEY: string, USE_GPU: boolean): Promise<FetchCodeCompletions> {
//     console.log(MODEL_NAME);
//     const API_URL = `https://api-inference.huggingface.co/models/${MODEL_NAME}`;
//     // Setup header with API key
//     // eslint-disable-next-line @typescript-eslint/naming-convention
//     const headers = { "Authorization": `Bearer ${API_KEY}` };
//     return new Promise((resolve, reject) => {
//         // Send post request to inference API
//         return fetch(API_URL, {
//             method: "POST",
//             body: JSON.stringify({
//                 "inputs": prompt, "parameters": {
//                     "max_new_tokens": 16, "return_full_text": false,
//                     "do_sample": true, "temperature": 0.8, "top_p": 0.95,
//                     "max_time": 10.0, "num_return_sequences": 3
//                 }
//             }),
//             headers: headers
//         })
//             .then(res => res.json())
//             .then(json => {
//                 if (Array.isArray(json)) {
//                     const completions = Array<string>();
//                     for (let i = 0; i < json.length; i++) {
//                         const completion = json[i].generated_text.trimStart();
//                         if (completion.trim() === "") continue;

//                         completions.push(
//                             completion
//                         );
//                     }
//                     console.log(completions);
//                     resolve({ completions });
//                 }
//                 else {
//                     console.log(json);
//                     throw new Error(json["error"]);
//                 }
//             })
//             .catch(err => reject(err));
//     });
// }

// export function fetchCodeCompletionTextsFaux(prompt: string): Promise<FetchCodeCompletions> {
//     console.log('fastertransformer');
//     return new Promise((resolve, reject) => {
//         const oa = new openai.OpenAIApi(
//             new openai.Configuration({
//                 apiKey: "dummy",
//                 basePath: "http://localhost:5000/v1",
//             }),
//         );
//         const response = oa.createCompletion({
//             model: "fastertransformer",
//             prompt: prompt as openai.CreateCompletionRequestPrompt,
//             stop: ["\n\n"],
//         });
//         return response
//             .then(res => res.data.choices)
//             .then(choices => {
//                 if (Array.isArray(choices)) {
//                     const completions = Array<string>();
//                     for (let i = 0; i < choices.length; i++) {
//                         const completion = choices[i].text?.trimStart();
//                         if (completion === undefined) continue;
//                         if (completion?.trim() === "") continue;

//                         completions.push(
//                             completion
//                         );
//                     }
//                     console.log(completions);
//                     resolve({ completions });
//                 }
//                 else {
//                     console.log(choices);
//                     throw new Error("Error");
//                 }
//             })
//             .catch(err => reject(err));
//     });
// }