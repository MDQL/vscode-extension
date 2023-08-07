import { DataSource, MDQLCodeBlock, Query, QueryExecutor } from "@mdql/mdql";

import * as MarkdownIt from "markdown-it";
import Renderer = require("markdown-it/lib/renderer");
import {
  isHideQueryActive,
  isInjectModeActive,
  parseInfoString,
} from "./info-string-parser";
import { createLogger } from "./logging";

export function createMarkdownItMdqlPlugin(db: DataSource) {
  return (md: MarkdownIt) => {
    const originalRender = md.render;

    md.render = (src: string, env?: any): string => {
      const codeBlocks = MDQLCodeBlock.scan(src);
      for (const codeBlock of codeBlocks) {
        const executor = new QueryExecutor(db);
        const result = executor.execute(codeBlock.query!);
      }
      return originalRender(src, env);
    };
    return md;
  };
}

export function mdqlPlugin(md: MarkdownIt, db: DataSource) {
  const log = createLogger("mdqlPlugin");
  const original = md.renderer.rules.fence?.bind(md.renderer.rules);
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    const code = token.content.trim();

    if (token.info.startsWith("mdql")) {
      const properties = parseInfoString(token.info);

      let renderedQuery = "";
      let renderedResult = "";
      if (!isHideQueryActive(properties)) {
        renderedQuery = `<pre>${code}</pre>`;
      }

      if (!isInjectModeActive(properties)) {
        try {
          const query = Query.parse(code);
          const executor = new QueryExecutor(db);
          const result = executor.execute(query);
          renderedResult = `<pre>${result.toMarkdown()}</pre>`;
        } catch (e) {
          renderedResult = `<pre>ERROR: ${e}</pre>`;
        }
      }
      return `${renderedQuery}${renderedResult}`;
    } else {
      return original ? original(tokens, idx, options, env, slf) : "";
    }
  };
}
