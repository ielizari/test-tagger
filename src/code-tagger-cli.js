#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const regexParse = require('./regex/parser');
const peggyParser = require('./peggy').parser;
const { parseFiles } = require('./utils/parser');
const { createReport } = require('./utils/report');
const { getFilePath } = require('./utils/files');

global.debug = false;


const argv = yargs(hideBin(process.argv)).argv
if (argv.debug) {
  global.debug = true;
}
global.config = getConfig(argv.config);

function getConfig(path) {
  const defaultConfig = require('./config/default.json');
  const hostConfigPath = path ? path : '.codetag.json';
  const hostConfig = require(getFilePath(hostConfigPath));
  return {
    ...defaultConfig,
    ...hostConfig,
  };
}

const parseFile = (file) => {
  return peggyParser.parse(file.trim(), {
    autotags: config.autotags
  });
}

parseFiles(parseFile).then(
  (files) => {
    createReport(files);
  },
  (error) => {
    console.log('Error', error)
  }
);