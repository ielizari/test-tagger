const regexParse = require('./regex/parser');
const peggyParser = require('./peggy').parser;
const utils = require('./utils/listFiles');
const fs = require('fs');

const parseFile = (file) => {
  return peggyParser.parse(file.trim());
}
utils.parseFiles('./test', parseFile).then(
  (files) => {
    utils.createReport(files);
  },
  (error) => {
    console.log('Error', error)
  }
);

//const result = peggyParser.parse(fileWithDocBlock.trim());
//console.dir(result, { depth: null });

