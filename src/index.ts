import { parsePipe, parseTransclude, parseArgument, parseLink } from "./parser";
import Position from "./position";
import Token from "./token";
import { Nesting } from "./token";

interface Tag {
  type: string;
  position: Position;
  nesting: Nesting;
}

function matchBrace(
  tokens: Token[],
  tags: Tag[],
  match: RegExpExecArray,
  pos: number,
  isTemplate: boolean,
  endLen: number = match[0].length
) {
  const beginBraceTag = tags.findLast(
    (tag) => tag.type === "brace" && tag.nesting === Nesting.open
  );
  if (beginBraceTag && match) {
    while (tags.at(-1) !== beginBraceTag) {
      tags.pop();
    }
    tags.pop();
    let beginLen = beginBraceTag.position.length;
    if (isTemplate) {
      while (endLen > 2 && beginLen > 2) {
        beginLen -= 3;
        endLen -= 3;
        tokens.push(
          new Token(
            "argument",
            new Position(
              beginBraceTag.position.begin + beginLen,
              pos + match[0].length - endLen
            )
          )
        );
      }
    }
    while (endLen > 1 && beginLen > 1) {
      beginLen -= 2;
      endLen -= 2;
      tokens.push(
        new Token(
          "transclude",
          new Position(
            beginBraceTag.position.begin + beginLen,
            pos + match[0].length - endLen
          )
        )
      );
    }
    if (beginLen > 1) {
      beginBraceTag.position.end -= beginBraceTag.position.length - beginLen;
      if (beginBraceTag.position.length) tags.push(beginBraceTag);
    } else if (endLen >= 2) {
      endLen = matchBrace(tokens, tags, match, pos, isTemplate, endLen);
    }
  }
  return endLen;
}

function matchBracket(
  tokens: Token[],
  tags: Tag[],
  match: RegExpExecArray,
  pos: number,
  endLen: number = match[0].length
) {
  const beginBracketTag = tags.findLast(
    (tag) => tag.type === "bracket" && tag.nesting === Nesting.open
  );
  if (beginBracketTag && match) {
    while (tags.at(-1) !== beginBracketTag) {
      tags.pop();
    }
    tags.pop();
    let beginLen = beginBracketTag.position.length;
    while (endLen > 1 && beginLen > 1) {
      beginLen -= 2;
      endLen -= 2;
      tokens.push(
        new Token(
          "link",
          new Position(
            beginBracketTag.position.begin + beginLen,
            pos + match[0].length - endLen
          )
        )
      );
    }
    while (endLen > 0 && beginLen > 0) {
      beginLen -= 1;
      endLen -= 1;
      tokens.push(
        new Token(
          "extLink",
          new Position(
            beginBracketTag.position.begin + beginLen,
            pos + match[0].length - endLen
          )
        )
      );
    }
    if (beginLen > 0) {
      beginBracketTag.position.end -=
        beginBracketTag.position.length - beginLen;
      if (beginBracketTag.position.length) tags.push(beginBracketTag);
    } else if (endLen > 0) {
      endLen = matchBracket(tokens, tags, match, pos, endLen);
    }
  }
  return endLen;
}

export default class WikitextParser {
  src: string;
  isTemplate: boolean;
  private root: Token;

  constructor() {}

  private initialize(src: string, isTemplate: boolean) {
    this.src = src;
    this.isTemplate = isTemplate;
  }

  private tokenize() {
    const tokens: Token[] = [];
    const tags: Tag[] = [];
    let match: RegExpExecArray;
    let pos = 0;
    while (pos < this.src.length) {
      if (
        tags.length > 0 &&
        tags.at(-1).type === "comment" &&
        tags.at(-1).nesting === Nesting.open
      ) {
        // if has comment start tag, find close tag first
        match = /-->/.exec(this.src.substring(pos));
        const beginTag = tags.pop();
        if (match) {
          tokens.push(
            new Token(
              "comment",
              new Position(
                beginTag.position.begin,
                pos + match.index + match[0].length
              )
            )
          );
          pos += tags.at(-1).position.length;
          continue;
        }
        // if no close tag, comment to the end of the document
        tokens.push(
          new Token(
            "comment",
            new Position(beginTag.position.begin, this.src.length)
          )
        );
        break;
      }
      match = /^<!--/.exec(this.src.substring(pos));
      if (match) {
        tags.push({
          type: "comment",
          position: new Position(pos, pos + match[0].length),
          nesting: Nesting.open,
        });
        pos += tags.at(-1).position.length;
        continue;
      }
      match = /^\{\{+/.exec(this.src.substring(pos));
      if (match) {
        tags.push({
          type: "brace",
          position: new Position(pos, pos + match[0].length),
          nesting: Nesting.open,
        });
        pos += tags.at(-1).position.length;
        continue;
      }
      match = /^\}\}+/.exec(this.src.substring(pos));
      if (match) {
        const rest = matchBrace(tokens, tags, match, pos, this.isTemplate);
        pos += match[0].length - rest;
        continue;
      }
      match = /^\[\[+/.exec(this.src.substring(pos));
      if (match) {
        tags.push({
          type: "bracket",
          position: new Position(pos, pos + match[0].length),
          nesting: Nesting.open,
        });
        pos += tags.at(-1).position.length;
        continue;
      }
      match = /^\]\]+/.exec(this.src.substring(pos));
      if (match) {
        const rest = matchBracket(tokens, tags, match, pos);
        pos += match[0].length - rest;
        continue;
      }
      pos++;
    }
    return tokens;
  }

  private parse(tokens: Token[]) {
    this.root = new Token("root", new Position(0, this.src.length));
    tokens.forEach((token) => {
      this.root.addChild(token);
    });

    tokens.forEach((token) => {
      if (
        token.type === "transclude" ||
        token.type === "argument" ||
        token.type === "link"
      ) {
        parsePipe(token, this.src);
        if (token.type === "transclude") {
          parseTransclude(token, this.src);
        } else if (token.type === "argument") {
          parseArgument(token, this.src);
        } else if (token.type === "link") {
          parseLink(token, this.src);
        }
      }
    });
  }

  parseWiki(src: string, isTemplate: boolean = false) {
    this.initialize(src, isTemplate);
    this.parse(this.tokenize());
    return this.root;
  }
}
