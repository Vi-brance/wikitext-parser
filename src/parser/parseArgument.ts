import Token from "../token";

export function parseArgument(token: Token, src: string) {
  if (token.type !== "argument") throw new Error('Should be a argument token');
}