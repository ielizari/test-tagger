#!/usr/bin/env node
const regexParse = require('./regex/parser');
const peggyParser = require('./peggy').parser;
const { parseFiles } = require('./utils/parser');
const { createReport } = require('./utils/report');
const { getFilePath } = require('./utils/files');

const [,, ...args] = process.argv;
const config = getConfig();

function getConfig() {
  const defaultConfig = require('./config/default.json');
  const hostConfig = require(getFilePath('.codetag.json'));
  return {
    ...defaultConfig,
    ...hostConfig,
  };
}

const parseFile = (file) => {
  return peggyParser.parse(file.trim());
}

parseFiles(config, parseFile).then(
  (files) => {
    createReport(config, files);
  },
  (error) => {
    console.log('Error', error)
  }
);