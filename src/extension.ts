import * as vscode from "vscode";
import { SuggestionManager } from "./suggestions/suggestionManager";

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("[TypeFixer] Extension is now active!");

  const suggestionManager = new SuggestionManager();

  vscode.languages.registerCodeActionsProvider("typescript", {
    provideCodeActions(
      document: vscode.TextDocument,
      range: vscode.Range
    ): vscode.CodeAction[] {
      const code = document.getText();
      const suggestions = suggestionManager.getSuggestions(code);

      return suggestions.map((suggestion) => {
        const newText = getNewText(suggestion, document, range);
        const action = new vscode.CodeAction(
          `${newText}`,
          vscode.CodeActionKind.QuickFix
        );
        action.command = {
          command: "extension.applySuggestion",
          title: "Apply Suggestion",
          arguments: [suggestion, document, range],
        };
        return action;
      });
    },
  });

  vscode.commands.registerCommand(
    "extension.applySuggestion",
    (
      suggestion: string,
      document: vscode.TextDocument,
      range: vscode.Range
    ) => {
      const edit = new vscode.WorkspaceEdit();
      const line = document.lineAt(range.start.line);

      if (
        suggestion.includes("Convert float to string") ||
        suggestion.includes("Convert number to string") ||
        suggestion.includes("Convert boolean to string") ||
        suggestion.includes("Convert unquoted text to string")
      ) {
        const newText = applySuggestion(suggestion, line.text);
        edit.replace(document.uri, line.range, newText);
      }

      return vscode.workspace.applyEdit(edit).then((success) => {
        if (success) {
          vscode.window.showInformationMessage(
            `[TypeFixer] Applied suggestion: ${suggestion}`
          );
        } else {
          vscode.window.showErrorMessage(
            "[TypeFixer] Failed to apply suggestion"
          );
        }
      });
    }
  );
}

function applySuggestion(suggestion: string, oldText: string): string {
  if (suggestion.includes("Convert float to string")) {
    return oldText.replace(
      /(\w+\()(\d+\.\d+)(\);)/,
      (match, p1, p2, p3) =>
        `${p1}"${p2}"${p3} // This converts the float to a string because the data type requires a string.`
    );
  }
  if (suggestion.includes("Convert number to string")) {
    return oldText.replace(
      /(\w+\()(\d+)(\);)/,
      (match, p1, p2, p3) =>
        `${p1}"${p2}"${p3} // This converts the number to a string because the data type requires a string.`
    );
  }
  if (suggestion.includes("Convert boolean to string")) {
    return oldText.replace(
      /(\w+\()(true|false)(\);)/i,
      (match, p1, p2, p3) =>
        `${p1}"${p2}"${p3} // This converts the boolean to a string because the data type requires a string.`
    );
  }
  if (suggestion.includes("Convert unquoted text to string")) {
    return oldText.replace(
      /(\w+\()([a-zA-Z_]\w*)(\);)/,
      (match, p1, p2, p3) =>
        `${p1}"${p2}"${p3} // This converts the unquoted text to a string because the data type requires a string.`
    );
  }
  return oldText;
}

function getNewText(
  suggestion: string,
  document: vscode.TextDocument,
  range: vscode.Range
): string {
  const line = document.lineAt(range.start.line).text;
  let newText = line;

  if (suggestion.includes("Convert float to string")) {
    newText = line.replace(/(\w+\()(\d+\.\d+)(\);)/, '$1"$2"$3');
  }
  if (suggestion.includes("Convert number to string")) {
    newText = line.replace(/(\w+\()(\d+)(\);)/, '$1"$2"$3');
  }
  if (suggestion.includes("Convert boolean to string")) {
    newText = line.replace(/(\w+\()(true|false)(\);)/i, '$1"$2"$3');
  }
  if (suggestion.includes("Convert unquoted text to string")) {
    newText = line.replace(/(\w+\()([a-zA-Z_]\w*)(\);)/, '$1"$2"$3');
  }

  return newText;
}
