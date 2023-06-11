const docblock = /^\s*\/\*\*\n(\s*\*\s@.*\n)*\s*\*\/\n\s*(describe|it|test)\s*\((?<arguments>.*)\)?.*\{?/gm;

//docblock ^[ \t\f]*\/\*\*\n([ \t\f]*\*[ \t]@.*\n)*[ \f\t]*\*\/[ \t\f]*\n
const item = /^\s*\*\s@(?<itemName>[^\s]+) (?<itemValue>.+)\n*/gm;
const functions = /(?<fnName>describe\(.*\))/gm;

function regexParse(code) {
  if(!code) code = '';
  let result = [];
  const blocks = findAllMatches(code, docblock);

  blocks.forEach((doc) => {
    result.push({
      block: doc,
      tags: findAllMatches(doc[0], item)
    });
  });
  //console.log(result)
  return result;
}

function findAllMatches(text, pattern) {
  let matches = [];
  let match;
  do {
    match = pattern.exec(text);
    if (match) {
      matches.push(match)
    }
  } while(match)

  return matches;
}

module.exports = {
  regexParse,
  findAllMatches,
}