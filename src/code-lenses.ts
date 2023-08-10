import { MDQLCodeBlock } from "@mdql/mdql";
import * as vscode from "vscode";
import { createLogger } from "./logging";
import { RefreshCommand } from "./command-refresh";
import { isInjectModeActive, parseInfoString } from "./info-string-parser";
import { InjectCommand } from "./command-inject";
export function registerCodeLens(context: vscode.ExtensionContext) {
  const log = createLogger("CodeLens provider");
  const codeLensProvider = vscode.languages.registerCodeLensProvider(
    { pattern: "**/*.md" }, // This pattern means the CodeLens will be provided for all file types
    {
      provideCodeLenses(document) {
        const codeBlocks = MDQLCodeBlock.scan(document.getText());
        const lenses = codeBlocks.flatMap((codeBlock) => {
          const start = document.positionAt(codeBlock.blockPos.startIndex);
          const end = document.positionAt(codeBlock.blockPos.endIndex);
          log.info(
            `Lens create for ${start.line + 1}.${start.character} to ${
              end.line + 1
            }.${end.character}`
          );
          const lenses: vscode.CodeLens[] = [];
          const lensRange = new vscode.Range(start, end);

          const mainLens = new vscode.CodeLens(lensRange);
          mainLens.command = {
            title: `MDQL Block`,
            command: "",
          };
          lenses.push(mainLens);

          const refreshLens = new vscode.CodeLens(lensRange);
          refreshLens.command = {
            title: `Refresh`,
            command: RefreshCommand.id,
          };
          lenses.push(refreshLens);

          const parsedInfo = parseInfoString(codeBlock.infoString);
          if (isInjectModeActive(parsedInfo)) {
            const refreshLens = new vscode.CodeLens(lensRange);
            refreshLens.command = {
              title: codeBlock.content ? "Reinject" : "Inject",
              command: InjectCommand.id,
              arguments: [codeBlock],
            };
            lenses.push(refreshLens);
          }

          return lenses;
        });

        return lenses;
      },
    }
  );

  context.subscriptions.push(codeLensProvider);
}
