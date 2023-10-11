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
const someTrackingIdCounter = 0;
const delay: number = delayTime;
export class IntellicodeCompletionProvider
  implements vscode.InlineCompletionItemProvider
{
  private context: vscode.ExtensionContext;
  constructor(c: vscode.ExtensionContext) {
    this.context = c;
  }

  public async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<
    | vscode.InlineCompletionItem[]
    | vscode.InlineCompletionList
    | null
    | undefined
  > {
    console.log("new event!");
    console.log('this.context.triggerKind',context.triggerKind);
    console.log('context.selectedCompletionInfo',context.selectedCompletionInfo);

    const API_BASE = process.env.API_BASE || DEFAULT_API_BASE;
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showInformationMessage(
        "Please open a file first to use LineCopilot."
      );
      return { items: [] };
    }

    const requestId = new Date().getTime();

    // Delays the triggering
    lastRequest = requestId;
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (lastRequest !== requestId) return { items: [] };

    console.log("real to get");

    const textBeforeCursor = document.getText();
    if (!textBeforeCursor.trim()) return { items: [] };

      // Calculates the current line before cursor once and reuses it
      const currLineBeforeCursor = document.getText(
        new vscode.Range(position.with(undefined, 0), position)
      );
      // const currLineBeforeCursor = document.getText(new vscode.Selection(
      //   0,
      //   0,
      //   position.line,
      //   position.character
      // ));
      // console.log("currLineBeforeCursor2", currLineBeforeCursor2);
      
      if (currLineBeforeCursor.trim()) {
        let rs;
        console.log("currLineBeforeCursor", currLineBeforeCursor.trim());
        try {
          rs = await fetchLineCompletionTexts(
            currLineBeforeCursor.trim(),
            API_BASE,
            apiKey,
            bookID
          );
          
        } catch (err) {
          // Simplifies error handling and returns statement
          if (err instanceof Error)
            vscode.window.showErrorMessage(err.toString());
          return { items: [] };
        }

      if (!rs || !rs.completions || !rs.completions.length)
        return { items: [] };

        let trackingIdCounter = 0;
        
        // Maps the result to a new array once instead of pushing in a loop
        const items: any[] = rs.completions.map((completion) => ({
          insertText: completion,
          range: new vscode.Range(
            position.translate(0, completion.length),
            position
          ),
          trackingId: `snippet-${trackingIdCounter++}`,
        }));
        // console.log('items',items);

      return { items };
    } else {
      return { items: [] };
    }
  }
}