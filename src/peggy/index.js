const peggy = require('peggy');
const path = require("path");
const fs = require('fs');
const rules = fs.readFileSync(path.resolve(__dirname, './rules.pegjs'), 'utf8');
const parser = peggy.generate(rules);

const parseFile = (file) => {
  return parser.parse(file.trim(), {
    autotags: config.autotags
  });
}

module.exports = { parser, parseFile };
