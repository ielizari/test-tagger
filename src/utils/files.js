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

const jsonString = (data) => {
  return JSON.stringify(data, null, 2);
}

module.exports = {
  readFile,
  writeFile,
  getFilePath,
  listFiles,
  jsonString,
}