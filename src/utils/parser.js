const path = require('path');
const { readFile, listFiles } = require('./files.js');

const parseFile = (fn, filePath) => {
  const absolutePath = path.resolve(config.rootDir, filePath);
  const fileContent = fn(readFile(absolutePath));
  return parsedFileDto(absolutePath, fileContent);
}

const parsedFileDto = (filePath, fileContent) => {
  return {
    file: filePath,
    content:  fileContent
  };
}

const parseFiles = async(fn) => {
  const files = await listFiles();
  return files
    .map((file) => parseFile(fn, file));
}

const mapFiles = (files) => {
  return files
    .map((node) => mapNode(node.file, node.content))
    .flat(Number.POSITIVE_INFINITY);
}

const mapNode = (file, content, parentTags, parentAutoTags) => {
  const result = content.map((item) => {
    let tags = item.codeTags?.tags || [];
    let autotags = item.autoTags || [];
    if (Array.isArray(parentTags)) {
      tags = parentTags.concat(tags);
    }
    if(Array.isArray(parentAutoTags)) {
      autotags = parentAutoTags.concat(autotags).filter((tag, index, array) => array.indexOf(tag) === index);
    }
    item.codeTags = tags;
    item.autoTags = autotags;
    item.nested = item.nested?.length ? mapNode(file, item.nested, tags, autotags) : [];
    item.itemCount = item.nested.reduce((total, test) => {
      return {
        items: total.items + test.itemCount.items + 1,
        tests: test.type === 'test' && ['it', 'test'].includes(test.name) ? total.tests + test.itemCount.tests + 1 : total.tests + test.itemCount.tests,
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
  });

  const mergedTags = mapTag(tags).concat(mapTag(test.autoTags, true));

  return {
    ...test,
    tags: mergedTags,
    codeTags: tags,
    modifiers: modifiers,
    file,
  }
}

const mapTag = (tagList, autotag = false) => {
  if(!Array.isArray(tagList)) return [];
  return tagList.map((tag) => {
    if(typeof tag === 'object') return tag;
    return {
      name: tag,
      auto: autotag,
    }
  })
}

module.exports = {
  parseFiles,
  parsedFileDto,
  mapFiles,
}