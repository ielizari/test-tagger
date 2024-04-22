const path = require('path');
const { readFile, listFiles } = require('./files.js');
const SKIP = 'skip';
const INHERITED_SKIP = 'inherit_skip';

const parseFile = (fn, filePath) => {
  const absolutePath = path.resolve(config.rootDir, filePath);
  console.log(`Parsing file: ${absolutePath}`);
  try {
    const fileContent = fn(readFile(absolutePath), filePath);
    return parsedFileDto(absolutePath, fileContent);
  } catch (err) {
    return {
      type: 'peggyError',
      file: absolutePath,
      error: err,
      trace: err.stack,
    }
  }
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
  let tagList = [];
  const fileNodes = files
    .map((node) => {
      const [nodes, fileTagList] = mapNode(node.file, node.content);
      tagList = tagList.concat(fileTagList);
      return nodes;
    })
    .flat(Number.POSITIVE_INFINITY);
  const tags = Array.from(new Set(tagList));
  return [ fileNodes, tags ];
}

const isTest = (test) => {
  return test.type === 'test' && ['it', 'test'].includes(test.name);
}

const mapNode = (file, content, parentTags, parentAutoTags, skipped) => {
  let tagList = [];
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
    item.autoTags = (autotags && autotags.filter((autoTag) => !tags.includes(autoTag))) || [];
    tagList = tagList.concat(tags);
    tagList = tagList.concat(autotags);
    item.skipped = skipped ? INHERITED_SKIP : item.modifiers.includes('skip') && SKIP;
    if (item.skipped && !item.modifiers.includes('skip')) item.modifiers.push('skip');
    if (item.nested?.length) {
      const [nestedNodes, nestedTagList] = mapNode(file, item.nested, tags, autotags, item.skipped);
      item.nested = nestedNodes;
      tagList = tagList.concat(nestedTagList);
    } else {
      item.nested = [];
    }
    item.itemCount = item.nested.reduce((total, test) => {
      const checkTest = isTest(test);
      return {
        items: total.items + test.itemCount.items + 1,
        tests: checkTest ? total.tests + test.itemCount.tests + 1 : total.tests + test.itemCount.tests,
        skipped: total.skipped + test.itemCount.skipped + (checkTest && test.skipped ? 1 : 0),
      }
    }, { items: 0, tests: 0, skipped: 0 });
    return treeDTO(item, file);
  });
  return [ result, tagList ];
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