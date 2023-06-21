const { readFile, writeFile, jsonString } = require('./files.js');

const createReport = (config, data) => {
  let template = readFile('../view/report_template.html', __dirname);
  const outDir = config.outputDir.endsWith('/') ? config.outputDir : `${config.outputDir}/`;
  const dataString = jsonString(data);
  const cssString = readFile('../view/styles.css', __dirname);
  const jsString = readFile('../view/report.js', __dirname);
  template = template
    .replace(/###css###/, cssString)
    .replace(/###js###/, jsString)
    .replace(/###data###/, dataString);

  writeFile(`${outDir}data.json`, dataString);
  writeFile(`${outDir}index.html`, template);
}

module.exports = {
  createReport,
}