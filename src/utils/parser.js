const path = require('path');
const { readFile, listFiles } = require('./files.js');

const parseFile = (fn, rootDir, filePath) => {
  const absolutePath = path.resolve(rootDir, filePath);
  const fileContent = readFile(absolutePath);
  return {
    file: absolutePath,
    content:  fn(fileContent)
  };
}

const parseFiles = async(fn) => {
  const files = await listFiles(config);
  return files
    .map((file) => parseFile(fn, config.rootDir, file))
    .map((node) => mapNode(node.file, node.content))
    .flat(Number.POSITIVE_INFINITY);
}

const mapNode = (file, content, parentTags) => {
  const result = content.map((item) => {
    let tags = item.codeTags?.tags || [];
    if (Array.isArray(parentTags)) {
      tags = parentTags.concat(tags);
    }
    item.codeTags = tags;
    item.nested = item.nested?.length ? mapNode(file, item.nested, tags) : [];
    item.nestedItemsCount = item.nested.reduce((total, test) => {
      return {
        items: total.items + test.nestedItemsCount.items + 1,
        tests: test.type === 'test' && ['it', 'test'].includes(test.name) ? total.tests + test.nestedItemsCount.tests + 1 : total.tests + test.nestedItemsCount.tests,
      }
    }, { items: 0, tests: 0 });
    return treeDTO(item, file);
  });
  return result;
}

const treeDTO = (test, file) => {
  const tags = Object.entries(test.codeTags).reduce((result, item) => {
    const [key, value] = item;
    return result.concat(value);
  }, []);
  const modifiers = test.modifiers.map((modifier) => {
    if (typeof modifier === 'object') {
      return modifier.type;
    }
    return modifier;
  })

  return {
    ...test,
    codeTags: tags,
    modifiers: modifiers,
    itemCount: test.nestedItemsCount,
    file,
  }
}

module.exports = {
  parseFiles,
}