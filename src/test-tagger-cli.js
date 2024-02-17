#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const regexParse = require('./regex/parser');
const { parseFile: peggyParser } = require('./peggy');
const { createReport } = require('./utils/report');
const { parseFiles, mapFiles } = require('./utils/parser');
const { getFilePath } = require('./utils/files');
const { nodeColors } = require('./utils/colors.js');
const util = require('util');

global.debug = false;
console.time('Execution time');

const argv = yargs(hideBin(process.argv)).argv
if (argv.debug) {
  global.debug = true;
}
global.config = getConfig(argv.config);

if (argv.dryrun) {
  global.dryrun = true;
}

function getConfig(path) {
  const defaultConfig = require('./config/default.json');
  const hostConfigPath = path ? path : '.testag.json';
  const hostConfig = require(getFilePath(hostConfigPath));
  return {
    ...defaultConfig,
    ...hostConfig,
  };
}

function getErrorMessage(file) {
  if (file.error.expected) {
    return `Expected ${file.error?.expected?.[1]?.type} of input or ${file.error?.expected?.[0]?.description}`+
    ` but ${util.inspect(file.error?.found)} found at line ${file.error?.location?.start?.line}, `+
    `column ${file.error?.location?.start?.column}.`;
  } else {
    return file.trace;
  }
}

parseFiles(peggyParser)
  .then((parsedFiles) => {
    let errFiles = []
    let preMappedFiles = [];
    parsedFiles.forEach((file) => {
      file.type === 'peggyError' ?
        errFiles.push(file) :
        preMappedFiles.push(file);
    })
    const mappedFiles = mapFiles(preMappedFiles);
    const { summary } = createReport(mappedFiles, errFiles, global.dryrun);

    console.log(nodeColors('FgGreen'), `Parsed ${summary.testCount} tests in ${summary.fileCount} files`, nodeColors('FgWhite'));
    errFiles.length && console.log(nodeColors('FgRed'), `\nExcluded ${errFiles.length} files`);
    errFiles.forEach((file) => {
      console.error(
        'Error parsing file: ',
        nodeColors('FgGreen'),
        file.file + ':',
        nodeColors('FgWhite'),
        getErrorMessage(file)
      )
    });
    if(errFiles.length) {
      console.error(nodeColors('FgWhite'), `Check ${process.cwd()}/${config.outputDir}/error.log for detailed information.\n`)
    }
  })
  .finally(() => {
    console.timeEnd('Execution time');
  });
