import type Position from "./position";

export enum Nesting {
  open,
  closed,
}

export default class Token {
  type: string;
  pos: Position;
  children: Token[] = [];

  constructor(type: string, pos: Position) {
    this.type = type;
    this.pos = pos;
  }

  addChild(child: Token) {
    if (child.pos.begin < this.pos.begin || this.pos.end < child.pos.end) {
      throw new Error("Invalid position");
    }
    let index = 0;
    while (index < this.children.length) {
      const currentChild = this.children[index];
      if (
        child.pos.begin <= currentChild.pos.begin &&
        child.pos.end >= currentChild.pos.end
      ) {
        child.addChild(currentChild);
        this.children.splice(index, 1);
      } else if (child.pos.begin >= currentChild.pos.end) {
        index++;
      } else if (child.pos.end <= currentChild.pos.begin) {
        break;
      } else {
        throw new Error("Invalid position");
      }
    }
    this.children.splice(index, 0, child);
  }

  inChildren(pos: number, ...type: string[]) {
    for (const child of this.children) {
      if (
        child.pos.begin <= pos &&
        pos < child.pos.end &&
        type.includes(child.type)
      )
        return child;
    }
  }
}
