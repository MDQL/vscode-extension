import pino from "pino";
import * as vscode from "vscode";

let outputTransport: VscodeOutputTransport;

export function createLogger(name: string) {
  return pino({ name: name, level: "debug" }, outputTransport);
}

export function initLogger(outputChannel: vscode.OutputChannel) {
  outputTransport = new VscodeOutputTransport(outputChannel);
}

class VscodeOutputTransport {
  constructor(private outputChannel: vscode.OutputChannel) {}

  write(logObject: any) {
    const formattedLog = JSON.stringify(logObject, null, 2);
    this.outputChannel.appendLine(formattedLog);
  }
}
