function isSpace(char: string) {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r';
}

export function skipEmptyChar(src: string, pos: number) {
  while (pos < src.length && isSpace(src[pos])) pos++;
  return pos;
}

export function skipEmptyCharBack(src: string, pos: number) {
  while (pos > 0 && isSpace(src[pos - 1])) pos--;
  return pos;
}
