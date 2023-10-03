import * as vscode from "vscode";
import { CSConfig, DEFAULT_API_BASE,bookID,apiKey} from "../config";
import { fetchLineCompletionTexts } from "../utils/fetchCodeCompletions";

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
      // 读取用户配置
      const API_BASE = process.env.API_BASE || DEFAULT_API_BASE;
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage(
          "Please open a file first to use LineCopilot."
        );
        return;
      }

      // vscode.comments.createCommentController
      const textBeforeCursor = document.getText();
      if (textBeforeCursor.trim() === "") {
        return { items: [] };
      }
      const currLineBeforeCursor = document.getText(
        new vscode.Range(position.with(undefined, 0), position)
      );

      // Check if user's state meets one of the trigger criteria
      if (
        CSConfig.SEARCH_PHARSE_END.includes(textBeforeCursor.slice(-1)) ||
        currLineBeforeCursor.trim() === ""
      ) {
        let rs = null;

        try {
          // 这里需要做一个更好的截断
          for (let i = currLineBeforeCursor.length - 1; i >= 0; i--) {
            if (CSConfig.SERACH_CHINESE_END.includes(currLineBeforeCursor[i])) {
              rs = await fetchLineCompletionTexts(
                currLineBeforeCursor.slice(i, -1),
                API_BASE,
                apiKey,
                bookID
              );
              break;
            }
          }

          if (rs == null) {
            rs = await fetchLineCompletionTexts(
              currLineBeforeCursor.slice(0, -1),
              API_BASE,
              apiKey,
              bookID
            );
          }

          // rs = await fetchLineCompletionTexts(textBeforeCursor, API_BASE, apiKey, bookID);
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
            trackingId: `snippet-${i}`,
          });
        }
        return { items };
      }
      return { items: [] };
    },
  };
  return provider;
}
