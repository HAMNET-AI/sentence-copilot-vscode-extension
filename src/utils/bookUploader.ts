import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import * as vscode from "vscode";
import { DEFAULT_API_BASE, apiKey } from "../config";

export function bookUploader(path: string) {
    const APU_BASE = process.env.API_BASE || DEFAULT_API_BASE;
    const API_URL = `${APU_BASE}/book`;

    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "multipart/form-data",
    };

    const formData = new FormData();
    const binary = fs.readFileSync(path);
    const name = path.split("/").pop();

    formData.append(
        "book",
        binary,
        {
            filename: name,
            contentType: "text/plain",
        }    
    );

    const headersWithFormData = Object.assign(headers, formData.getHeaders());

    fetch(API_URL, {
        method: "POST",
        headers: headersWithFormData,
        body: formData,
    })
    .then(res => res.json())
    .then(json => {
        if (json?.code === 0) {
            const book_id = json?.data?.book_id;
            vscode.window.showInformationMessage("Upload success");
            vscode.window.showInformationMessage(`Book ID: ${book_id}`);
        } else {
            console.log(json);
            const msg = json?.msg || "Upload failed";
            vscode.window.showErrorMessage(msg);
        }
    });

}