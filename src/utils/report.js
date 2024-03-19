const { readFile, writeFile, jsonString } = require('./files.js');

const createReport = (data, errFiles, dryrun = false) => {
  let template = readFile('../view/vanilla/report_template.html', __dirname);
  const outDir = config.outputDir.endsWith('/') ? config.outputDir : `${config.outputDir}/`;
  const timestamp = getDateTime();
  const reportConfig = getConfigScript();
  const finalData = {
    created: timestamp,
    config: global.config,
    data: data,
    error: errFiles,
  }
  const jsonFullData = jsonString(finalData);
  const jsonData = jsonString(finalData.data);
  const errJsonData = jsonString(errFiles);
  const dataString = '<script type="text/javascript">const reportData=' + jsonData + '</script>';
  const cssString = getReportCss(readFile('../view/vanilla/styles.css', __dirname));
  const jsString = getReportScript(readFile('../view/vanilla/report.js', __dirname));
  const tabulatorScript = getTabulatorScript();
  const tabulatorCss = getTabulatorCss();

  template = template
    .replace(/###timestamp###/, timestamp)
    .replace(/###css###/, cssString)
    .replace(/###js###/, jsString)
    .replace(/###config###/, reportConfig)
    .replace(/###data###/, dataString)
    .replace(/###tabulator_script###/, tabulatorScript)
    .replace(/###tabulator_css###/, tabulatorCss);

  if (!dryrun) {
    writeFile(`${outDir}data.json`, jsonFullData);
    if (errFiles?.length) {
      writeFile(`${outDir}error.log`, errJsonData);
    }
    writeFile(`${outDir}index.html`, template);
  }

  return {
    data: jsonData,
    report: template,
    summary: getSummary(data),
  }
}

const getSummary = (data) => {
  const fileCount = data.length;
  let testCount = 0;
  let skipCount = 0;

  data.forEach((file) => {
    testCount += file.itemCount.tests;
    skipCount += file.itemCount.skipped;
  });

  return {
    fileCount,
    testCount,
    skipCount,
  }
}

const getDateTime = () => {
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

const getConfigScript = () => {
  const reportCfg = {}
  reportCfg.coverage = global.config.coverage;
  reportCfg.autotags = global.config.autotags;
  return '<script type="text/javascript">const reportCfg =' + jsonString(reportCfg) + ';</script>'
}

const getTabulatorCss = () => {
  try {
    const content = readFile('node_modules/tabulator-tables/dist/css/tabulator.min.css', process.cwd());
    return '<style>' + content + '</style>';
  } catch (e) {
    return '<link href="https://unpkg.com/tabulator-tables@5.5.0/dist/css/tabulator.min.css" rel="stylesheet"></link>'
  }
}
const getTabulatorScript = () => {
  try {
    const content = readFile('node_modules/tabulator-tables/dist/js/tabulator.min.js', process.cwd())
    return '<script type="text/javascript">' + content + '</script>';
  } catch (e) {
    return '<script type="text/javascript" src="https://unpkg.com/tabulator-tables@5.5.0/dist/js/tabulator.min.js"></script>';
  }
}

module.exports = {
  createReport,
  getSummary,
}