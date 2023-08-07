import * as vscode from "vscode";

const configSection = "markdown-data-views";

export class Config {
  private get<T>(key: string): T {
    return vscode.workspace.getConfiguration(configSection).get(key) as T;
  }

  get globPattern(): string {
    return this.get<string>("glob-pattern");
  }

  get logLevel(): string {
    return this.get<string>("log-level");
  }

  get autoRefreshIndex(): boolean {
    return this.get<boolean>("auto-refresh-index");
  }
}
