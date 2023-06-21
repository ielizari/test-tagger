const { readFile, writeFile, jsonString } = require('./files.js');

const createReport = (config, data) => {
  let template = readFile('src/view/report_template.html');
  const outDir = config.outputDir.endsWith('/') ? config.outputDir : `${config.outputDir}/`;
  const dataString = jsonString(data);
  template = template.replace(/###data###/, dataString);
  writeFile(`${outDir}data.json`, dataString);
  writeFile(`${outDir}index.html`, template);
}

module.exports = {
  createReport,
}