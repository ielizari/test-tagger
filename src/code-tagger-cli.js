#!/usr/bin/env node
const regexParse = require('./regex/parser');
const peggyParser = require('./peggy').parser;
const utils = require('./utils/listFiles');

const [,, ...args] = process.argv;
const config = getConfig();

function getConfig() {
  const defaultConfig = require('./config/default.json');
  const hostConfig = require(utils.getFilePath('.codetag.json'));
  return {
    ...defaultConfig,
    ...hostConfig,
  };
}

const parseFile = (file) => {
  return peggyParser.parse(file.trim());
}

utils.parseFiles(config, parseFile).then(
  (files) => {
    utils.createReport(files);
  },
  (error) => {
    console.log('Error', error)
  }
);