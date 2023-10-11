

export const CSConfig = {
    SEARCH_PHARSE_END: [' '],
    SERACH_CHINESE_END: ['。', '……', ' ','.', '!', '?', '；',  '？', '！', '——', '———', '———', '——']
};


export const DEFAULT_API_BASE = "http://localhost:5050";

export const extensionId = "Hamnet.SentenceCopilot";
export const extensionVersion = "0.0.1";

import { workspace } from "vscode";

const configuration = workspace.getConfiguration("SentenceCopilot", undefined);

export const bookID = configuration.get("bookID", "");
export const apiKey = configuration.get("apiKey", "");
export const delayTime = configuration.get("completionDelay", 1) * 1000;