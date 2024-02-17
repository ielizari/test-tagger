# Test Tagger
## 1. Overview
A javascript static analysis tool for automated code documentation. Detects testing function calls with or without docblock annotations providing tags meta-data for the test. Creates an interactive report in html format with the tests in a project.

## 2.Usage
### 2.1 Installation
Add test-tagger to yout project as a develorper dependency
```
npm i --save-dev test-tagger
```
Add command to `package.json` in order to execute report
```
scripts: {
  test-tagger: 'test-tagger'
}
```
Run the script to generate project report
```
npm run test-tagger
```
By default, the report will be created in `./test-tagger/` folder in your project's root folder. It will parse every file in your project with the `.spec.js` extension. This can be configured to meet your project's needs as will be seen in the next section.
### 2.2 Configure
#### 2.2.1 Default configuration
Test-tagger will automatically look for a `.testag.json` configuration file in the project's root folder. If a config file is found, it will be merged with the default config:
```json
{
  "rootDir": ".",
  "include": [
    "**/*.spec.js"
  ],
  "exclude": [
    "**/node_modules/**",
    "*/.git/**"
  ],
  "parser": "peggy",
  "outputDir": "report",
}
```
#### 2.2.2 Custom configuration
test-tagger script accepts a config argument, allowing to have multiple report scripts in a single project. If a config argument is provided, it will be used instead of the root's `testag.config.json` file (if present).
In `package.json`:
```json
scripts {
  "test-tagger:unit-tests": "test-tagger --config=tests/unit/config/testag.config.json",
  "test-tagger:integration-tests": "test-tagger --config=tests/integration/config/testag.config.json"
}
```

### 2.2.3 Configuration values
* **rootDir**: Sets base path for the script. All other paths and path patterns in the config file will be relative to this path. If its value is ".", your project's root folder will be used as the base path.

* **include**: Array containing a list of [Glob](https://www.npmjs.com/package/glob) patterns. If a file in the project matches at least one of this patterns, it will be included in the list of files to be parsed by the script.

* **exclude**: Array containing a list of [Glob](https://www.npmjs.com/package/glob) patterns. If a file matches at least one of this patterns, it will be excluded from the list of files to be parsed, even if it also matches a pattern in the include array.

* **parser**: Default 'peggy'. Parser script to be used on the list of target files.

* **outputDir**: Folder where the report files will be created. If the folder doesn't exist, it will be create too.

* **autotags**: Array containing a list of autotag objects defining rules to automatically tag tests.
  * **tag**: Required. Tag label.
  * **disabled**: Optional. Enable or disable this tag. If disabled, it won't be added to the tests when creating the report.
  * **match**: Required. Array containing a list of keywords that correspond to this tag. If a test contains any of them it will be automatically tagged.
  * **path**: Optional. Tags a test if its file path matches at least one of the `include` array paths, and doesn't match none of the `exclude` array paths. This rule works together with the `match` array with an OR logic. So a test will be tagged with this tag if either match or path rules are satisfied.

* **coverage**: Summary nested structure to group tests based on their tags. Each level consist of an object with the following structure:
  * **label**: Required. String to be used as the level description in the report.
  * **tags**: Required. Simple or multidimensional strings array containing the tags present in a test to be included in this level. Tags in the first dimension will be interpreted as a logic AND. Tags in the inner dimensions will be interpreted as a log OR. For example: `"tags": [["javascript"], ["syntax", "semantics"]]` will include every test containing "javascript" AND ("syntax" OR "semantics") tags.
  * **children**: Optional. Nested items with this same structure (label, tags and children). To be included in a children level, a test must match the parent levels requirements too. **Tests will only be appended to a level without `children` elements.**


## 3 Autotags
It's possible to add a set of rules in the config file in order to automate adding tags to tests. This is a handy feature when we have a large set of tests on a project and we need to quicly create an initial report.

On the other hand, this feature should be used with caution because it's relatively easy to tag tests incorrectly. Manually tagging the tests should be the preferred strategy. Automatic tags are shown separated from manual tags in order to easily detect tests that should be manually tagged.

## 4 Custom report grouping
On the report generated, tests are grouped by the file they belong to. But it's also possible to create our custom grouping strategy in order to display the tests in any way we need. 

## 5 Developers
If you are interested in improving this library for your own use, or even willing to share it with the rest of us, check this [developers link](README_DEVELOPERS.md) for more info