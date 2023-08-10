// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { DocumentRepository } from "@mdql/mdql";
import * as vscode from "vscode";
import { registerCodeLens } from "./code-lenses";
import { InjectCommand } from "./command-inject";
import { RefreshCommand } from "./command-refresh";
import { Config } from "./config";
import { createLogger, initLogger } from "./logging";
import { mdqlPlugin } from "./markdown-it-mdql";

const markdownLanguageId = "markdown";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel("Markdown DataViews");
  initLogger(outputChannel);

  const log = createLogger("extension");
  const config = new Config();

  outputChannel.show();

  log.info("Markdown Data-Views activated");

  const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;
  const globPattern = config.globPattern;
  const pattern = `${workspacePath}/${globPattern}`;

  log.info(`Creating Document Repository with pattern ${pattern}`);
  const database = new DocumentRepository(pattern, config.ignorePatterns);

  context.subscriptions.push(new RefreshCommand(database).register());
  context.subscriptions.push(new InjectCommand(database).register());

  registerCodeLens(context);

  if (config.autoRefreshIndex) {
    log.info("Auto-refreshing index");
    vscode.commands.executeCommand(RefreshCommand.id);
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      if (document.languageId === markdownLanguageId) {
        log.info("Auto-refreshing index");
        vscode.commands.executeCommand(RefreshCommand.id);
      }
    });
  }

  return {
    extendMarkdownIt(md: any) {
      return md.use(mdqlPlugin(md, database));
    },
  };
}

// This method is called when your extension is deactivated
export function deactivate() {}
