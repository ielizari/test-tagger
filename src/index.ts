

const docblock = /\s*\/\*\*\n(\s*\*\s@.*\n)*\s*\*\/\n\s*(describe|it|test)\s*\((?<arguments>.*)\)?.*\{?/gm;
const item = /^\s*\*\s@(?<itemName>[^\s]+) (?<itemValue>.+)\n*/gm;
const functions = /(?<fnName>describe\(.*\))/gm;

const fileWithDocBlock = `
    /**
     * @tags pdp add_to_cart
     * @description Prueba1
     */
    describe('Test example #1', () => {
      console.log('veenga')
    });

    /**
     * @tags pdp add_to_cart
     * @description Prueba2
     */
    describe('Test example #2', () => {
      console.log('veenga2')
      /**
       * @tags finance
       */
      describe('Inner test', () => {
        console.log('vamos');
      });
    });
    `;

interface Analyzed {
  block: RegExpExecArray,
  tags: Array<RegExpExecArray>,
}

export function analyze(code?: string): Array<Analyzed> {
  if(!code) code = fileWithDocBlock;
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

analyze();