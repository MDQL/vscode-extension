import { Disposable } from "vscode";

export interface Command {
  id(): string;
  register(): Disposable;
}
