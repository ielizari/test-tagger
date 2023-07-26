const { readFile, writeFile, jsonString } = require('./files.js');

const createReport = (data, dryrun = false) => {
  let template = readFile('../view/report_template.html', __dirname);
  const outDir = config.outputDir.endsWith('/') ? config.outputDir : `${config.outputDir}/`;
  const jsonData = jsonString(data);
  const dataString = '<script type="text/javascript">const reportData=' + jsonData + '</script>';
  const cssString = getReportCss(readFile('../view/styles.css', __dirname));
  const jsString = getReportScript(readFile('../view/report.js', __dirname));
  const tabulatorScript = getTabulatorScript(readFile('dist/js/tabulator.min.js', 'node_modules/tabulator-tables'));
  const tabulatorCss = getTabulatorCss(readFile('dist/css/tabulator.min.css','node_modules/tabulator-tables'));
  const timestamp = getDateTime();
  template = template
    .replace(/###timestamp###/, timestamp)
    .replace(/###css###/, cssString)
    .replace(/###js###/, jsString)
    .replace(/###data###/, dataString)
    .replace(/###tabulator_script###/, tabulatorScript)
    .replace(/###tabulator_css###/, tabulatorCss);

  if (!dryrun) {
    writeFile(`${outDir}data.json`, jsonData);
    writeFile(`${outDir}index.html`, template);
  }

  return {
    data: jsonData,
    report: template,
  }
}

const  getDateTime = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = padNumber(date.getMonth()+1);
  const day = padNumber(date.getDate());
  const hour = padNumber(date.getHours());
  const minute = padNumber(date.getMinutes());
  const second = padNumber(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

const padNumber = (n, char = '0', pad = 2) => {
  return String(n).padStart(pad, char)
}

const getReportCss = (content) => {
  return global.debug ?
    '<link rel="stylesheet" href="../src/view/styles.css">' :
    '<style>' + content + '</style>';
}
const getReportScript = (content) => {
  return global.debug ?
    '<script type="text/javascript" src="../src/view/report.js"></script>' :
    '<script type="text/javascript">' + content + '</script>';
}

const getTabulatorCss = (content) => {
  return '<style>' + content + '</style>';
}
const getTabulatorScript = (content) => {
  return '<script type="text/javascript">' + content + '</script>';
}

module.exports = {
  createReport,
}