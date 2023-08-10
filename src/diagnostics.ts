import { MDQLCodeBlock } from "@mdql/mdql";
import * as vscode from "vscode";
import { createLogger } from "./logging";
import { mdqlRange2vscRange } from "./utils";

const log = createLogger("diagnostics");

export function createDiagnostics(context: vscode.ExtensionContext) {
  const collection = vscode.languages.createDiagnosticCollection("mdql");
  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document, collection);
  }
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      updateDiagnostics(editor.document, collection);
    }
  });

  context.subscriptions.push(collection);
}

function updateDiagnostics(
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
) {
  const codeBlocks = MDQLCodeBlock.scan(document.getText());
  const diagnostics = codeBlocks
    .filter((codeBlock) => codeBlock.error)
    .map((codeBlock) => mapCodeBlockToError(codeBlock, document))
    .filter(notEmpty);

  collection.set(document.uri, diagnostics);
}

function notEmpty<T>(value: T | undefined): value is T {
  return value !== undefined && value !== null;
}

function mapCodeBlockToError(
  codeBlock: MDQLCodeBlock,
  document: vscode.TextDocument
): vscode.Diagnostic | undefined {
  if (codeBlock.error) {
    return {
      range: mdqlRange2vscRange(codeBlock.blockPos),
      message: codeBlock.error.message,
      severity: vscode.DiagnosticSeverity.Error,
      source: "mdql",
    };
  }
}
