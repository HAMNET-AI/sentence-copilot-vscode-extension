import * as vscode from "vscode";
import { fetchLineCompletionTexts } from "./utils/fetchCodeCompletions";

// 读取环境变量 .env 文件
import * as dotenv from "dotenv";
import { CSConfig ,DEFAULT_API_BASE} from "./config";
dotenv.config();
const apiBase = process.env.API_BASE;

interface MyInlineCompletionItem extends vscode.InlineCompletionItem {
    trackingId: number;
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "extension.LineCopilotSettings",
    () => {
		vscode.commands.executeCommand("workbench.action.openSettings", "line-copilot");
    }
  );

  context.subscriptions.push(disposable);

  const provider: vscode.InlineCompletionItemProvider = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    provideInlineCompletionItems: async (
      document,
      position,
      context,
      token
    ) => {
      const configuration = vscode.workspace.getConfiguration("", document.uri);
      const API_BASE = apiBase || DEFAULT_API_BASE;
      const BOOK_ID = configuration.get("line-copilot.resource.bookID", "");
      const API_KEY = configuration.get("line-copilot.resource.bookAPIKey", "");

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
                API_KEY,
                BOOK_ID
              );
              break;
            }
          }

          if (rs == null) {
            rs = await fetchLineCompletionTexts(
              currLineBeforeCursor.slice(0, -1),
              API_BASE,
              API_KEY,
              BOOK_ID
            );
          }

          // rs = await fetchLineCompletionTexts(textBeforeCursor, API_BASE, API_KEY, BOOK_ID);
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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  vscode.languages.registerInlineCompletionItemProvider(
    { pattern: "**" },
    provider
  );
}
