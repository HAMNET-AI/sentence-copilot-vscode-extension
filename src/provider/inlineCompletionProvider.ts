import * as vscode from "vscode";
import {
  CSConfig,
  DEFAULT_API_BASE,
  bookID,
  apiKey,
  delayTime,
} from "../config";
import { fetchLineCompletionTexts } from "../utils/fetchCodeCompletions";

let lastRequest = null;
let someTrackingIdCounter = 0;
const delay: number = delayTime;

export function inlineCompletionProvider(
  extensionContext: vscode.ExtensionContext
) {
  const provider: vscode.InlineCompletionItemProvider = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    provideInlineCompletionItems: async (
      document,
      position,
      context,
      token
    ) => {
      console.log("new event!");

      // 读取用户配置
      const API_BASE = process.env.API_BASE || DEFAULT_API_BASE;
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage(
          "Please open a file first to use LineCopilot."
        );
        return;
      }

      // 延时触发
      const requestId = new Date().getTime();
      lastRequest = requestId;
      await new Promise((f) => setTimeout(f, delay));
      if (lastRequest !== requestId) {
        return { items: [] };
      }
      console.log("real to get");
      console.log("new command");

      // vscode.comments.createCommentController
      const textBeforeCursor = document.getText();
      if (textBeforeCursor.trim() === "") {
        return { items: [] };
      }
      const currLineBeforeCursor = document.getText(
        new vscode.Range(position.with(undefined, 0), position)
      );
      console.log("currLineBeforeCursor", currLineBeforeCursor);

      // Check if user's state meets one of the trigger criteria
      if (currLineBeforeCursor.trim() != "") {
        let rs = null;

        try {
          // 这里需要做一个更好的截断
          for (let i = CSConfig.SERACH_CHINESE_END.length - 1; i >= 0; i--) {
            if (currLineBeforeCursor.endsWith(CSConfig.SERACH_CHINESE_END[i])) {
              console.log("hit it", currLineBeforeCursor.slice(0, -1));
              rs = await fetchLineCompletionTexts(
                currLineBeforeCursor,
                API_BASE,
                apiKey,
                bookID
              );
              break;
            }
          }

          if (rs == null) {
            rs = await fetchLineCompletionTexts(
              currLineBeforeCursor,
              API_BASE,
              apiKey,
              bookID
            );
          }
        } catch (err) {
          if (err instanceof Error) {
            vscode.window.showErrorMessage(err.toString());
          }
          return { items: [] };
        }

        if (rs == null) {
          return { items: [] };
        }

        // Add the generated code to the inline suggestion list
        const items: any[] = [];
        for (let i = 0; i < rs.completions.length; i++) {
          items.push({
            insertText: rs.completions[i],
            range: new vscode.Range(
              position.translate(0, rs.completions.length),
              position
            ),
            trackingId: `snippet-${someTrackingIdCounter++}`,
          });
        }
        return { items };
      }
      return { items: [] };
    },
  };
  return provider;
}
