import Position from "../position";
import Token from "../token";
import { skipEmptyChar, skipEmptyCharBack } from "../utils";

export function parseLink(token: Token, src: string) {
  if (token.type !== "link") throw new Error("Should be a link token");
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
  }
}
