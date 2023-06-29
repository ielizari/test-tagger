#!/usr/bin/env node
const regexParse = require('./regex/parser');
const peggyParser = require('./peggy').parser;
const { parseFiles } = require('./utils/parser');
const { createReport } = require('./utils/report');
const { getFilePath } = require('./utils/files');

global.debug = false;
global.config = getConfig();

const [,, ...args] = process.argv;
if(args.includes('--debug')) {
  global.debug = true;
}

function getConfig() {
  const defaultConfig = require('./config/default.json');
  const hostConfig = require(getFilePath('.codetag.json'));
  return {
    ...defaultConfig,
    ...hostConfig,
  };
}

const parseFile = (file) => {
  return peggyParser.parse(file.trim(), {
    autotag: config.autotag
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