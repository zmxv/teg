export function splitText(text: string): string[] {
  return text.split(/\s+/);
}

export function matchPattern(pattern: string, text: string): boolean {
  const patternTokens = splitText(pattern);
  const textTokens = splitText(text);
  if (patternTokens.length === textTokens.length) {
    for (let i = 0; i < patternTokens.length; i++) {
      const token = patternTokens[i];
      const wildcard = token.split("_");
      if (wildcard.length === 2) {
        if (!textTokens[i].startsWith(wildcard[0]) || !textTokens[i].endsWith(wildcard[1]) ||
          wildcard[0].length + wildcard[1].length >= textTokens[i].length) {
          return false;
        }
      } else if (token !== textTokens[i]) {
        return false;
      }
    }
    return true;
  }
  return false;
}