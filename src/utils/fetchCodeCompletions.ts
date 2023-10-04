import fetch from "node-fetch";
import { URL } from "url";
import { CSConfig } from "../config";

export type FetchCodeCompletions = {
    completions: Array<string>
}

export function fetchLineCompletionTexts(prompt: string, API_BASE: string, API_KEY: string, BOOK_ID: string, timeoutMs = 5000): Promise<FetchCodeCompletions> {
    prompt = processPrompt(prompt);
    if (prompt === "") {
        return Promise.resolve({ completions: [] });
    }
    
    // 构建 API 请求 URL，将提示作为查询参数附加到 URL 中
    const API_URL = new URL(`${API_BASE}/book/${BOOK_ID}`);
    API_URL.searchParams.append("prompt", prompt);

    // 定义 HTTP 请求的头部，包括用于授权的 API_KEY
    const headers = { "Authorization": `Bearer ${API_KEY}` };

    // 返回一个 Promise 以处理 HTTP 请求的异步性质
    return new Promise((resolve, reject) => {
        // 设置超时处理
        const timeout = setTimeout(() => {
            reject(new Error("Request timed out"));
        }, timeoutMs);

        // 发出 HTTP GET 请求并处理响应
        fetch(API_URL, {
            method: "GET",
            headers: headers
        })
        .then(res => {
            clearTimeout(timeout); // 清除超时定时器
            return res.json(); // 解析 JSON 响应
        })
        .then(json => {
            if ((json?.code === 0) && (json?.data?.results !== undefined)) {
                const completions = [];
                for (const result of json.data.results) {
                    const completion = result.content.trimStart();
                    if (completion !== "" && completion !== "No results found.") {
                        const prmptIndex = completion.indexOf(prompt);
                        if (prmptIndex !== -1) {
                            completions.push(completion.slice(prmptIndex + prompt.length));
                        } else {
                            completions.push(completion);
                        }
                    }
                }
                resolve({ completions });
            } else {
                console.error(json); // 记录错误响应
                reject(new Error("API request failed"));
            }
        })
        .catch(err => {
            console.error(err); // 记录其他错误
            reject(err);
        });
    });
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
