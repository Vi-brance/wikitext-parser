import Position from "../position";
import Token from "../token";

export function parsePipe(token: Token, src: string) {
  if (
    token.type !== "transclude" &&
    token.type !== "argument" &&
    token.type !== "link"
  )
    throw new Error("Should be a translcude/argument/link token");
  //debug
  // console.log(src.substring(token.pos.begin, token.pos.end));
  for (let pos = token.pos.begin; pos < token.pos.end; pos++) {
    const targetChild = token.inChildren(pos, "transclude", "argument", "link");
    if (targetChild) {
      pos = targetChild.pos.end - 1;
      continue;
    }
    if (src[pos] === "|") {
      token.addChild(new Token("pipe", new Position(pos, pos + 1)));
    }
  }
}
