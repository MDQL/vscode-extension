import { Position, Range } from "@mdql/mdql";
import * as vscode from "vscode";

export function vscRange2MqdlRange(range: vscode.Range): Range {
  return new Range(
    vscPosition2Mdqlposition(range.start),
    vscPosition2Mdqlposition(range.end)
  );
}

export function mdqlRange2vscRange(range: Range): vscode.Range {
  return new vscode.Range(
    mdqlPosition2vscPosition(range.start),
    mdqlPosition2vscPosition(range.end)
  );
}

export function vscPosition2Mdqlposition(pos: vscode.Position): Position {
  return new Position(pos.line, pos.character + 1);
}
export function mdqlPosition2vscPosition(pos: Position): vscode.Position {
  return new vscode.Position(pos.line, pos.col - 1);
}
