// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { DocumentRepository, MDQLCodeBlock, QueryExecutor } from "@mdql/mdql";
import * as vscode from "vscode";
import { mdqlPlugin } from "./markdown-it-mdql";
import { isInjectModeActive, parseInfoString } from "./info-string-parser";
import { InjectCommand } from "./command-inject";
import { RefreshCommand } from "./command-refresh";
import { createLogger, initLogger } from "./logging";

const configSection = "markdown-data-views";
const configKeyGlobPattern="glob-pattern"
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel("Markdown DataViews");
  initLogger(outputChannel);

  const log = createLogger("extension");

  outputChannel.show();

  outputChannel.appendLine("Markdown Data-Views activated");

  const pattern = vscode.workspace.getConfiguration(configSection).get(configKeyGlobPattern) as string;
  log.info(`Creating Document Repository with pattern ${pattern}`);
  const database = new DocumentRepository(pattern);

  context.subscriptions.push(new RefreshCommand(database).register());
  context.subscriptions.push(new InjectCommand(database).register());

  const codeLensProvider = vscode.languages.registerCodeLensProvider(
    { pattern: "**/*.md" }, // This pattern means the CodeLens will be provided for all file types
    {
      provideCodeLenses(document) {
        const codeBlocks = MDQLCodeBlock.scan(document.getText());
        const lenses = codeBlocks.flatMap((codeBlock) => {
          const start = document.positionAt(codeBlock.blockPos.startIndex);
          const end = document.positionAt(codeBlock.blockPos.endIndex);
          outputChannel.appendLine(
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

  return {
    extendMarkdownIt(md: any) {
      return md.use(mdqlPlugin(md, database));
    },
  };
}

// This method is called when your extension is deactivated
export function deactivate() {}
