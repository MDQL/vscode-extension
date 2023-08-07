import pino from "pino";
import * as vscode from "vscode";
import { Config } from "./config";

let outputTransport: VscodeOutputTransport;

export function createLogger(name: string) {
  const level = new Config().logLevel;
  return pino({ name: name, level }, outputTransport);
}

export function initLogger(outputChannel: vscode.OutputChannel) {
  outputTransport = new VscodeOutputTransport(outputChannel);
}

class VscodeOutputTransport {
  constructor(private outputChannel: vscode.OutputChannel) {}

  write(logObject: any) {
    let formattedLog;
    try {
      const parsedObject = JSON.parse(logObject);
      formattedLog = `[${parsedObject?.name}] ${parsedObject?.msg}`;
    } catch (e) {
      formattedLog = JSON.stringify(logObject, null, 2);
    }

    this.outputChannel.appendLine(formattedLog);
  }
}
