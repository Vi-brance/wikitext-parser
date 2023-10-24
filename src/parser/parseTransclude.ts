import Position from "../position";
import Token from "../token";
import { skipEmptyChar, skipEmptyCharBack } from "../utils";

function printToken(src: string, token: Token) {
  console.log(src.substring(token.pos.begin, token.pos.end));
  for (const child of token.children)
    console.log(src.substring(child.pos.begin, child.pos.end));
}

export function parseTransclude(token: Token, src: string) {
  if (token.type !== "transclude")
    throw new Error("Should be a translcude token");
  let prePipe = null;
  for (
    let child = token.children[0];
    child;
    child = token.children[token.children.indexOf(child) + 1]
  ) {
    if (child.type !== "pipe") continue;
    if (prePipe === null) {
      token.addChild(
        new Token(
          "name",
          new Position(
            skipEmptyChar(src, token.pos.begin + 2),
            skipEmptyCharBack(src, child.pos.begin)
          )
        )
      );
      // debug
      // printToken(src, token);
      prePipe = child;
    } else {
      token.addChild(
        new Token(
          "parameter",
          new Position(
            skipEmptyChar(src, prePipe.pos.end),
            skipEmptyCharBack(src, child.pos.begin)
          )
        )
      );
      // debug
      // printToken(src, token);
      prePipe = child;
    }
  }
  if (!prePipe) {
    token.addChild(
      new Token(
        "name",
        new Position(
          skipEmptyChar(src, token.pos.begin + 2),
          skipEmptyCharBack(src, token.pos.end - 2)
        )
      )
    );
    // debug
    // printToken(src, token);
  } else {
    token.addChild(
      new Token(
        "parameter",
        new Position(
          skipEmptyChar(src, prePipe.pos.end),
          skipEmptyCharBack(src, token.pos.end - 2)
        )
      )
    );
    // debug
    // printToken(src, token);
  }
}
