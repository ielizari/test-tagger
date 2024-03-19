# Test Tagger
## 1. Overview
A javascript static analysis tool for automated jest tests documentation.
- Detects jest-like testing function calls with or without docblock annotations providing tags meta-data for the test.
- Creates an interactive report in html format with the tests in a project.
- Automates test tagging based on configuration rules
- Create functionality coverage reports
- Keep track of functionalities needing test coverage

## 2.Usage
### 2.1 Installation
This module can be used in dfferent ways, both equally functional:
#### 2.1.1 Global module
Add test-tagger as a global npm module
```
npm i -g test-tagger
```
#### 2.1.2 Local module
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
> ### First run
>
> At this point, we can check if test-tagger has been succesfully installed and configured.
>
>In a folder containing a javascript project with jest tests, and after creating a `.testag.json` config file at project's root folder with the basic config to find the paths to your project tests (if needed), run the script to generate project report
>```
>npm run test-tagger
>```
>By default, the report will be created in `./report/` folder in your project's root folder. It will parse every file in your project with the `.spec.js` extension, or the ones configured in `.testag.json`.
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

* **outputDir**: Folder where the report files will be created. If the folder doesn't exist, it will be create too. By default the folder will be `/report` in the root folder.

* <a id="autotags_config">**autotags**</a>: Array containing a list of autotag objects defining rules to automatically tag tests.
  * **tag**: Required. Tag label that will be added to the test if it matches tag string or at least one in match array.
  * **disabled**: Optional. Default: false. Optional. Enable or disable this tag. If disabled, it won't be added to the tests when creating the report.
  * **match**: Optional. Array containing a list of keywords that correspond to this tag. If a test contains any of them it will be automatically tagged.
  * **path**: Optional. Array | String. [Glob](https://www.npmjs.com/package/glob) pattern. Tags a test if its file path matches at least one of the array paths, and doesn't match none of the `exclude` array paths. This rule works together with the `match` array with an **OR** logic. So a test will be tagged with this tag if either match or path rules are satisfied.
  * **excludePath**: Optional. Array | String. [Glob](https://www.npmjs.com/package/glob) pattern. Tags a test if its file path **doesn't** match any of the array paths. This rule works together with the `match` array with an **AND** logic. So a test will be tagged with this tag if match is rule is satisfied and excludePath rules are not, despie path rules are satisfied.

* **coverage**: Summary nested structure to group tests based on their tags. Each level consist of an object with the following structure:
  * **label**: Required. String to be used as the level description in the report.
  * **tags**: Required. Simple or multidimensional strings array containing the tags present in a test to be included in this level. Tags in the first dimension will be interpreted as a logic AND. Tags in the inner dimensions will be interpreted as a log OR. For example: `"tags": [["javascript"], ["syntax", "semantics"]]` will include every test containing "javascript" AND ("syntax" OR "semantics") tags.
  * **children**: Optional. Nested items with this same structure (label, tags and children). To be included in a children level, a test must match the parent levels requirements too. **Tests will only be appended to a level without `children` elements.**


## 3 TAGS
Tagging your project tests is the main purpose of this module in order to use those tags for creating an interactive report where you will be able to use those tests as a real documentation of your project.

This module allows to reach that objective based on two different but complemetary approaches: Manual and Automatic tags.

### 3.1 Manual Tags
Manual tags are those that are added as dockblock (like javadoc) comments before tests. They have the javadoc kind of comment line starting with '@tags' followed by a blank space and the tag terms also separated by a blank space to differentiate them. ( Eg. * @tags tag1 tag2). Any other lines not starting with '@tags' will be ignored.

These kind of tags are the preferred type due to the fact that they are consciously added by the person that develops the test, or by the ones that revises them on pull requests. So they become a reliable source of information of the test meaning.

For example, if we have a test like this one in our project:
```
describe('Product Preview', () => {
  it('Shows product price', () => {
    const productPreview = screen.findByRole('region', { name: 'product_1'});
    expect(prodctPreview).toHaveTextContent('9.99 €');
  })
});
```

We could enrich that test with dockblock comments:

```
/**
 * @tags product preview
 */
describe('Product Preview', () => {
  /**
   * @tags price
   */
  it('Shows product price', () => {
    const productPreview = screen.findByRole('region', { name: 'product_1'});
    expect(prodctPreview).toHaveTextContent('9.99 €');
  })
});
```
And they will be matched by test-tagger in this way:
```
[
  {
    type: 'test',
    name: 'describe',
    test: 'Product Preview',
    modifiers: [],
    codeTags: {
      tags: [
        'product',
        'preview'
      ]
    },
    autoTags: [],
    nested: [
      {
        type: 'test',
        name: 'it',
        test: 'Shows product price',
        modifiers: [],
        codeTags: {
          tags: [
            'price'
          ]
        },
        autoTags: [],
        nested: [],
        location: {
          source: undefined,
          start: {
            offset: 71,
            line: 5,
            column: 3
          },
          end: {
            offset: 272,
            line: 12,
            column: 1
          }
        }
      }
    ],
    location: {
      source: undefined,
      start: {
        offset: 0,
        line: 1,
        column: 1
      },
      end: {
        offset: 275,
        line: 12,
        column: 4
      }
    }
  }
]
```
As can be seen, we have a type 'test', with name 'describe' and value 'Product preview' (the test description) with a nested array of test functions (one in this case) where the same object structure is reproduced. It also contains a 'codeTags' field where dockblock tags and autotags (not in this case) are included. Those tags will propagate to chidlren tests in the SPA.

Inner tests have the same structure described before, with their own dockblock tags that will also propagate to child detected tests (in the case of multiple nested descibre functions).

All of them have their own location property that shows the file, line, column start and end.

### 3.2 Automatic Tags
Manual tags looks like a perfect choice in a perfect world. But most of the time we will be working in a project with a huge set of tests already written, and it would take a lot of time to manually tag all of them. That's why this module also offers an auto-tagging feature, that will automatically tag tests based on a bunch of rules defined in the configuration file.

>T his feature should be used with caution because it's relatively easy to wrongly tag your tests. Manually tagging the tests should be the preferred strategy. Automatic tags are shown separated from manual tags in the html report in order to easily detect tests that should be manually tagged.

#### 3.2.1 Configure autotags
In your configuration file (`./testtag.config.json` by default) an autotag config can be added including this field:
```
autotags: 
[
  {
    "tag": "peggy",
    "disabled": false,
    "match": ["peggyjs", "peg", "pegjs"],
    "path": {
      "include": ["**/prueba*"]
    }
  },
]
```
In this example, tag 'peggy' will be added (since 'disabled' property is set to false) to every test containing the words set in the 'tag' value OR the 'match' property array ('peggyjs', 'peg' and 'pegjs') OR every test under a folder named 'prueba'

In order to add more tags, you should add as many objects as you need. The object structure is defined in <a href="#autotags_config">autotags config</a>.

Multiple autotag objects can be added under this object. In case onf conlict i don't know what will happen. But surely it won't be funny.
## 4 Custom report grouping
On the default report generated, tests are grouped by the file they belong to. But it's also possible to create our custom grouping strategy in order to display the tests in any way we need based on, tags, autoTags, file path or other match.

## 5 Developers
If you are interested in improving this library for your own use, or even willing to share it with the rest of us, check this [developers link](README_DEVELOPERS.md) for more info