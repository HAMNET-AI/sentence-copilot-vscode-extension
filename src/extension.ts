import * as vscode from "vscode";
import { fetchLineCompletionTexts } from "./utils/fetchCodeCompletions";

// 读取环境变量 .env 文件
import * as dotenv from "dotenv";
import { inlineCompletionProvider } from "./provider/inlineCompletionProvider";
import { bookUploader } from "./uploader/bookUploader";
dotenv.config();

interface MyInlineCompletionItem extends vscode.InlineCompletionItem {
    trackingId: number;
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "extension.SentenceCopilotSettings",
    () => {
		vscode.commands.executeCommand("workbench.action.openSettings", "SentenceCopilot");
    }
  );

  context.subscriptions.push(disposable);


  const bookUploadCommand = vscode.commands.registerCommand(
    "extension.SentenceCopilotBookUpload",
    (uri: vscode.Uri) => {
      console.log(uri.fsPath);
      bookUploader(uri.fsPath);
    }
  );
  context.subscriptions.push(bookUploadCommand);

  const provider = inlineCompletionProvider(context);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  vscode.languages.registerInlineCompletionItemProvider(
    { pattern: "**" },
    provider
  );
}
