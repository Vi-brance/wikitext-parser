export default class Position {
  begin: number;
  end: number;

  constructor(begin: number, end: number = begin) {
    if (begin > end) throw new Error("begin > end");
    this.begin = begin;
    this.end = end;
  }

  get length() {
    return this.end - this.begin;
  }
}
