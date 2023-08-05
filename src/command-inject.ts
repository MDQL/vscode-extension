import { DataSource, MDQLCodeBlock, QueryExecutor } from "@mdql/mdql";
import { Command } from "./command";
import * as vscode from "vscode";
import { createLogger } from "./logging";

export class InjectCommand implements Command {
  private log = createLogger(InjectCommand.name);
  public static id = "markdown-data-views.inject";
  constructor(private readonly db: DataSource) {}

  id(): string {
    return InjectCommand.id;
  }

  register(): vscode.Disposable {
    return vscode.commands.registerCommand(
      this.id(),
      async (codeBlock: MDQLCodeBlock) => {
        if (!codeBlock.query) {
          vscode.window.showErrorMessage("Missing or invalid query");
          return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage("No active editor");
          return;
        }

        const executor = new QueryExecutor(this.db);
        const result = executor.execute(codeBlock.query);
        const resultString =
          (codeBlock.hasContent() ? "" : "\n") + result.toMarkdown();
        const range = new vscode.Range(
          editor.document.positionAt(codeBlock.contentPos.startIndex),
          editor.document.positionAt(codeBlock.contentPos.endIndex)
        );
        this.log.debug(
          `Injecting into line ${range.start.line}.${range.start.character}-${range.end.line}.${range.end.character}`
        );
        await editor?.edit((editBuilder) => {
          editBuilder.replace(range, resultString);
        });
      }
    );
  }
}
