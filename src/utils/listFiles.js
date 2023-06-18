const fs = require('fs');
const path = require('path');

const walk = async (dirPath, fn) => Promise.all(
  await fs.promises.readdir(dirPath, { withFileTypes: true }).then((entries) => entries.map((entry) => {
    const childPath = path.join(dirPath, entry.name)
    if(entry.isDirectory()) {
      return  walk(childPath, fn);
    } else {
      if(!typeof fn === 'function') return childPath;
      if(childPath.endsWith('spec.js')) {
        const fileContent = readFile(childPath);
        return {
          file: childPath,
          content:  fn(fileContent)
        };
      }
    }
  })),
);

const listFiles = async (dirPath) => {
  const allFiles = await walk(dirPath);
  return allFiles.flat(Number.POSITIVE_INFINITY).filter();
}

const parseFiles = async (dirPath, fn) => {
  const allFiles = await walk(dirPath, fn);
  return allFiles
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
  fs.writeFileSync(getFilePath(projectPath), data , 'utf-8');
}
const getFilePath = (projectPath) => {
  return path.normalize(path.resolve(process.cwd(), projectPath));
}

module.exports = {
  readFile,
  getFilePath,
  listFiles,
  parseFiles,
  createReport,
}