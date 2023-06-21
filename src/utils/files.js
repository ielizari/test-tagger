const fs = require('fs');
const path = require('path');
const glob = require('glob');

const listFiles = async (config) => {
  return await glob.glob(config.include, {
    cwd: config.rootDir,
    nodir: true,
    ignore: config.exclude
  });
}

const parseFile = (fn, rootDir, filePath) => {
  const absolutePath = path.resolve(rootDir, filePath);
  const fileContent = readFile(absolutePath);
  return {
    file: absolutePath,
    content:  fn(fileContent)
  };
}

const parseFiles = async(config, fn) => {
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

const createReport = (data) => {
  let template = readFile('src/view/report_template.html')
  const dataString = JSON.stringify(data, null, 2);
  template = template.replace(/###data###/, dataString);
  writeFile('report/data.json', dataString);
  writeFile('report/index.html', template);
}

const readFile = (projectPath) => {
  return fs.readFileSync(getFilePath(projectPath), 'utf-8');
}
const writeFile = (projectPath, data) => {
  const dirName = path.dirname(projectPath);
  fs.mkdirSync(dirName, { recursive: true });
  fs.writeFileSync(getFilePath(projectPath), data , 'utf-8');
}
const getFilePath = (projectPath) => {
  return path.normalize(path.resolve(process.cwd(), projectPath));
}

module.exports = {
  readFile,
  writeFile,
  getFilePath,
  listFiles,
  parseFiles,
  createReport,
}