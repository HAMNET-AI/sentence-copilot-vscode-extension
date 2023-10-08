import fetch from "node-fetch";
import { URL } from "url";
import { CSConfig } from "../config";

export type FetchCodeCompletions = {
    completions: Array<string>
}

export async function fetchLineCompletionTexts(prompt: string, API_BASE: string, API_KEY: string, BOOK_ID: string, timeoutMs = 5000): Promise<FetchCodeCompletions> {
    prompt = processPrompt(prompt);
  
    if (prompt === "") return { completions: [] };
    
    const API_URL = new URL(`${API_BASE}/book/${BOOK_ID}`);
    API_URL.searchParams.append("prompt", prompt);

    const headers = { "Authorization": `Bearer ${API_KEY}` };
  
    try {
        
        const res = await Promise.race([
            fetch(API_URL.toString(), { method: "GET", headers }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeoutMs))
        ]) as any;
      
        
        if (!res.ok) throw new Error("API request failed");
        
        const json = await res.json();

        if ((json?.code !== 0) || (json?.data?.results === undefined)) throw Error("Bad response");

        return {
            completions: json.data.results.map((result:any)=> {
                const completion = result.content.trimStart();
                const prmptIndex = completion.indexOf(prompt);
                return prmptIndex !== -1 ? completion.slice(prmptIndex + prompt.length) : completion;
            }).filter((completion :any) => completion && completion !== "No results found.")
          };

     } catch (err) {
         console.error(err); 
         throw err; 
     }
}

function processPrompt(prompt: string) {
    
    prompt = prompt.trim();
    let lastEndIndex = -1;
    for (const endChar of CSConfig.SERACH_CHINESE_END) {
        const endIndex = prompt.lastIndexOf(endChar);
        if (endIndex === prompt.length - 1) {
            continue;
        }
        if (endIndex > lastEndIndex) {
            lastEndIndex = endIndex;
        }
    }
    if (lastEndIndex === -1) {
        return prompt;
    } else {
        return prompt.slice(lastEndIndex + 1);
    }
}


export async function fetchCompletionByLineId(lineId: number, API_BASE: string, API_KEY: string, BOOK_ID: string, timeoutMs = 5000): Promise<FetchCodeCompletions> {
    const API_URL = new URL(`${API_BASE}/book/${BOOK_ID}/${lineId}`);

    const headers = { "Authorization": `Bearer ${API_KEY}` };
  
    try {
        
        const res = await Promise.race([
            fetch(API_URL.toString(), { method: "GET", headers }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeoutMs))
        ]) as any;
      
        
        if (!res.ok) throw new Error("API request failed");
        
        const json = await res.json();

        if ((json?.code !== 0) || (json?.data?.results === undefined)) throw Error("Bad response");

        return {
            completions: json.data.results.map((result:any)=> {
                const completion = result.content.trimStart();
                return  completion;
            }).filter((completion :any) => completion && completion !== "No results found.")
          };

     } catch (err) {
         console.error(err); 
         throw err; 
     }
}