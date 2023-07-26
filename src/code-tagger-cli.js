#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const regexParse = require('./regex/parser');
const { parseFile: peggyParser } = require('./peggy');
const { createReport } = require('./utils/report');
const { parseFiles, mapFiles } = require('./utils/parser');
const { getFilePath } = require('./utils/files');

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
  const hostConfigPath = path ? path : '.codetag.json';
  const hostConfig = require(getFilePath(hostConfigPath));
  return {
    ...defaultConfig,
    ...hostConfig,
  };
}

parseFiles(peggyParser)
  .then((parsedFiles) => {
    const mappedFiles = mapFiles(parsedFiles);
    createReport(mappedFiles, global.dryrun);

    const fileCount = mappedFiles.length;
    const testCount = mappedFiles.reduce((total, currentFile) => {
      return total + currentFile.itemCount.tests;
    }, 0);
    console.log(`Parsed ${testCount} tests in ${fileCount} files`);
  })
  .finally(() => {
    console.timeEnd('Execution time');
  });
