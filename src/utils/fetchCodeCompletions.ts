import fetch from "node-fetch";
import { URL } from "url";
import { CSConfig } from "../config";
import { promises } from "dns";
import { P } from "nextra/dist/types-fa5ec8b0";

export type FetchCodeCompletions = {
  completions: Array<string>;
};

export type bookMeta = {
  book_id: string;
  name: string;
};

export async function fetchLineCompletionTexts(
  prompt: string,
  API_BASE: string,
  API_KEY: string,
  BOOK_ID: string,
  next_number = 1,
  timeoutMs = 5000
): Promise<FetchCodeCompletions> {
  prompt = processPrompt(prompt);

  if (prompt === "") return { completions: [] };

  const API_URL = new URL(`${API_BASE}/book/v1/${BOOK_ID}`);
  API_URL.searchParams.append("prompt", prompt);
  API_URL.searchParams.append("next_number", next_number.toString());
  API_URL.searchParams.append("optional_num", "5");
  const headers = { Authorization: `Bearer ${API_KEY}` };

  try {
    const res = (await Promise.race([
      fetch(API_URL.toString(), { method: "GET", headers }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
      ),
    ])) as any;

    if (!res.ok) throw new Error("API request failed");

    const json = await res.json();

    if (json?.code !== 0 || json?.data?.results === undefined)
      throw Error("Bad response");

    return {
      completions: json.data.results
        .map((result: any) => {
          const completion = result.content.trimStart();
          const promptLastThree = prompt.length > 3 ? prompt.slice(-3) : prompt;
          const prmptIndex = completion.indexOf(promptLastThree);

          console.log("completion", completion);
          console.log("prompt", prompt);
          console.log("promptIndex", prmptIndex);

          return prmptIndex !== -1
            ? completion.slice(prmptIndex + prompt.length)
            : completion;
        })
        .filter(
          (completion: any) => completion && completion !== "No results found."
        ),
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

function processPrompt(prompt: string) {
  prompt = prompt.trim();
  return prompt;
}

export async function fetchCompletionByLineId(
  lineId: number,
  API_BASE: string,
  API_KEY: string,
  BOOK_ID: string,
  timeoutMs = 5000
): Promise<FetchCodeCompletions> {
  const API_URL = new URL(`${API_BASE}/book/${BOOK_ID}/${lineId}`);

  const headers = { Authorization: `Bearer ${API_KEY}` };

  try {
    const res = (await Promise.race([
      fetch(API_URL.toString(), { method: "GET", headers }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
      ),
    ])) as any;

    if (!res.ok) throw new Error("API request failed");

    const json = await res.json();

    if (json?.code !== 0 || json?.data?.results === undefined)
      throw Error("Bad response");

    return {
      completions: json.data.results
        .map((result: any) => {
          const completion = result.content.trimStart();
          return completion;
        })
        .filter(
          (completion: any) => completion && completion !== "No results found."
        ),
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function fetchAvailableBookMeta(
  API_BASE: string,
  API_KEY: string,
  timeoutMs = 5000
): Promise<any> {
  const API_URL = new URL(`${API_BASE}/book`);

  const headers = { Authorization: `Bearer ${API_KEY}` };

  try {
    const res = (await Promise.race([
      fetch(API_URL.toString(), { method: "GET", headers }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
      ),
    ])) as any;

    if (!res.ok) throw new Error("API request failed");

    const json = await res.json();

    if (json?.code !== 0) throw Error("Bad response");

    return json.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
