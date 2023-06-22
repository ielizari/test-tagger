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
    return treeDTO(item, file);
  });
  return result;
}

const treeDTO = (test, file) => {
  const tags = Object.entries(test.codeTags).reduce((result, item) => {
    const [key, value] = item;
    return result.concat(value);
  }, []);
  return {
    ...test,
    codeTags: tags,
    file,
  }
}

module.exports = {
  parseFiles,
}