import { DataSource } from "@mdql/mdql";
import * as vscode from "vscode";
import { Command } from "./command";
import { createLogger } from "./logging";

export class RefreshCommand implements Command {
  private log = createLogger(RefreshCommand.name);
  public static id = "markdown-data-views.refresh-index";
  constructor(private readonly db: DataSource) {}

  id(): string {
    return RefreshCommand.id;
  }

  register(): vscode.Disposable {
    return vscode.commands.registerCommand(this.id(), async () => {
      await this.db.refresh();
      this.log.info(
        `Database contains ${this.db.documents().length} docs and ${
          this.db.tasks().length
        } tasks`
      );
    });
  }
}
