const docblock = /^\s*\/\*\*\n(\s*\*\s@.*\n)*\s*\*\/\n\s*(describe|it|test)\s*\((?<arguments>.*)\)?.*\{?/gm;

//docblock ^[ \t\f]*\/\*\*\n([ \t\f]*\*[ \t]@.*\n)*[ \f\t]*\*\/[ \t\f]*\n
const item = /^\s*\*\s@(?<itemName>[^\s]+) (?<itemValue>.+)\n*/gm;
const functions = /(?<fnName>describe\(.*\))/gm;

interface Analyzed {
  block: RegExpExecArray,
  tags: Array<RegExpExecArray>,
}

export function regexParse(code?: string): Array<Analyzed> {
  if(!code) code = '';
  let result: Array<Analyzed> = [];
  const blocks = findAllMatches(code, docblock);

  blocks.forEach((doc) => {
    result.push({
      block: doc,
      tags: findAllMatches(doc[0], item)
    });
  });
  console.log(result)
  return result;
}

export function findAllMatches(text: string, pattern: RegExp): Array<RegExpExecArray> {
  let matches: Array<RegExpExecArray> = [];
  let match: RegExpExecArray | null;
  do {
    match = pattern.exec(text);
    if (match) {
      matches.push(match)
    }
  } while(match)

  return matches;
}