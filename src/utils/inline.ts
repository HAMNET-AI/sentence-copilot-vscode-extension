import * as vscode from "vscode";

/**
 * The function checks if there is any non-whitespace character after the cursor position in the
 * current line of the editor.
 * @param {any} editor - The `editor` parameter represents the code editor instance where the document
 * is being edited. It provides methods and properties to interact with the editor, such as getting the
 * current cursor position.
 * @param {any} document - The `document` parameter represents the current document or file that is
 * being edited. It contains information about the content and structure of the document, such as
 * lines, ranges, and text.
 * @returns a boolean value. If the trailing string (characters after the cursor position on the
 * current line) matches the regular expression pattern, it will return false. Otherwise, it will
 * return true.
 */
function middleOfLineWontComplete(editor: any, document: any) {
  const cursorPosition = editor.selection.active;
  const currentLine = document?.lineAt(cursorPosition.line);
  const lineEndPosition = currentLine?.range.end;
  const selectionTrailingString = new vscode.Selection(
    cursorPosition.line,
    cursorPosition.character,
    cursorPosition.line,
    lineEndPosition.character + 1
  );
  const trailingString = document.getText(selectionTrailingString);
  const re = /^[\][){} ;\n\r\t'"]*$/;
  if (re.test(trailingString)) {
    return false;
  } else {
    return true;
  }
}


/**
 * The function checks if the cursor is at the middle of a line by examining the trailing string after
 * the cursor position and returning true if it is not empty.
 * @param {any} editor - The `editor` parameter represents the code editor where the document is being
 * edited. It provides methods and properties to interact with the editor, such as getting the current
 * cursor position.
 * @param {any} document - The `document` parameter represents the current document or text being
 * edited in the editor. It contains information about the text, such as the lines, characters, and
 * ranges.
 * @returns a boolean value. It returns `true` if there is non-whitespace content after the cursor
 * position on the current line, and `false` if there is only whitespace or no content after the cursor
 * position.
 */
function isAtTheMiddleOfLine(editor: any, document: any) {
  const cursorPosition = editor.selection.active;
  const currentLine = document?.lineAt(cursorPosition.line);
  const lineEndPosition = currentLine?.range.end;

  const selectionTrailingString = new vscode.Selection(
    cursorPosition.line,
    cursorPosition.character,
    cursorPosition.line,
    lineEndPosition.character + 1
  );
  const trailingString = document.getText(selectionTrailingString);
  const trimmed = trailingString.trim();
  return trimmed.length !== 0;
}

/**
 * The `removeTrailingCharsByReplacement` function removes trailing characters from a string by
 * replacing them with a specified replacement string.
 * @param {string} completion - The `completion` parameter is a string that represents the original
 * text or code that you want to modify by removing trailing characters.
 * @param {string} replacement - The `replacement` parameter is a string that represents the characters
 * that need to be removed from the end of the `completion` string.
 * @returns The function `removeTrailingCharsByReplacement` returns the modified `completion` string
 * after removing any trailing characters that are not balanced brackets with the `replacement` string.
 */
function removeTrailingCharsByReplacement(
  completion: string,
  replacement: string
) {
  for (const ch of replacement) {
    if (!isBracketBalanced(completion, ch)) {
      completion = replaceLast(completion, ch, "");
    }
  }
  return completion;
}

/**
 * The function replaces the last occurrence of a substring in a string with a specified replacement.
 * @param {string} str - The `str` parameter is a string that you want to modify.
 * @param {string} toReplace - The `toReplace` parameter is a string that represents the substring you
 * want to replace in the original string.
 * @param {string} replacement - The `replacement` parameter is the string that will replace the last
 * occurrence of the `toReplace` string in the `str` string.
 * @returns The function `replaceLast` returns a new string with the last occurrence of `toReplace`
 * replaced with `replacement`. If `toReplace` is not found in the string `str`, the original string
 * `str` is returned.
 */
function replaceLast(str: string, toReplace: string, replacement: string) {
  const pos = str.lastIndexOf(toReplace);
  if (pos > -1) {
    return (
      str.substring(0, pos) +
      replacement +
      str.substring(pos + toReplace.length)
    );
  } else {
    return str;
  }
}

/**
 * The function checks if the given string has balanced brackets of a specific character type.
 * @param {string} str - The `str` parameter is a string that represents a sequence of characters. It
 * can contain any combination of characters, including brackets.
 * @param {string} character - The `character` parameter in the `isBracketBalanced` function represents
 * the type of bracket character that you want to check for balance. It can be one of the following
 * values: `{`, `}`, `[`, `]`, `(`, or `)`.
 * @returns a boolean value indicating whether the brackets in the given string are balanced or not.
 */
function isBracketBalanced(str: string, character: string) {
  let count = 0;
  for (const ch of str) {
    if (ch === character) {
      count++;
    }
    if (
      (character === "{" && ch === "}") ||
      (character === "[" && ch === "]") ||
      (character === "(" && ch === ")") ||
      (character === "}" && ch === "{") ||
      (character === "]" && ch === "[") ||
      (character === ")" && ch === "(")
    ) {
      count--;
    }
  }
  return count === 0;
}
