const peggy = require('peggy');
const path = require("path");
const fs = require('fs');
const rules = fs.readFileSync(path.resolve(__dirname, './rules.pegjs'), 'utf8');
const parser = peggy.generate(rules);
const { minimatch } = require('minimatch');

const parseFile = (file, filePath) => {
  return parser.parse(file.trim(), {
    autotags: config.autotags
    // autotags: config.autotags.filter((tag) => {
    //   const isIncluded = tag.path?.include?.length ?
    //     tag.path.some((fPath) => minimatch(filePath, fPath)):
    //     true;
    //   const isExcluded = tag.path?.exclude?.length ?
    //     tag.path.some((fPath) => minimatch(filePath, fPath)) :
    //     false;
    //   return isIncluded && !isExcluded;
    // }),
  });
}



module.exports = { parser, parseFile };
