const { readFile, writeFile, jsonString } = require('./files.js');

const createReport = (data) => {
  let template = readFile('../view/report_template.html', __dirname);
  const outDir = config.outputDir.endsWith('/') ? config.outputDir : `${config.outputDir}/`;
  const jsonData = jsonString(data);
  const dataString = '<script type="text/javascript">const reportData=' + jsonData + '</script>';
  const cssString = getReportCss(readFile('../view/styles.css', __dirname));
  const jsString = getReportScript(readFile('../view/report.js', __dirname));
  template = template
    .replace(/###css###/, cssString)
    .replace(/###js###/, jsString)
    .replace(/###data###/, dataString);

  writeFile(`${outDir}data.json`, jsonData);
  writeFile(`${outDir}index.html`, template);
}

const getReportCss = (content) => {
  return debug ?
    '<link rel="stylesheet" href="../src/view/styles.css">' :
    '<style>' + content + '</style>';
}
const getReportScript = (content) => {
  return debug ?
    '<script type="text/javascript" src="../src/view/report.js"></script>' :
    '<script type="text/javascript">' + content + '</script>';
}

module.exports = {
  createReport,
}