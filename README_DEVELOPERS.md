# Code-tagger for developers
## 1. Installation
Clone the project
```
git clone git@github.com:ielizari/code-tagger.git
```
Move inside the newly created folder
```
cd code-tagger
```
Install dependencies
```
npm i
```
Create test report of code-tagger
```
npm run app
```
After executing last command, a `report` folder must have been created in the project root folder. Inside it we can find a `data.json` file including the parsed data and an `index.html` file that, if opened in a browser, will show a user interface allowing us to inspect the parsed data and filter it.

_Create test report in debug mode_
```
npm run app -- --debug
```
Executing below command with the `--debug` argument allows us to modify the user interface css and javascript without the need to run again `npm run app` in order to regenerate the html file. Just refresh the browser.


## 2. Install module in host project
In order to test this library as a local npm module in a locally installed project, follow next steps
### 2.1 Build code-tagger as module
In code-tagger project folder, run next command in order to pack the project
```
npm run build
```
A `.dist` folder must have been created in the project containing a `code-tagger-<version>.tgz` file.

### 2.2 Installation in host project
Get the full path in your system to the tgz file created in previous step. This path must be in a format including forward slashes for directories. For exmple, in a Windows system the path `C:\projects\libs\code-tagger\.dist\code-tagger-0.1.0.tgz` should be formated as `/c/projects/libs/code-tagger/.dist/code-tagger-0.1.0.tgz`

Move to your host project where you want to try `code-tagger` and run the next command to install `code-tagger` from a local project
```
npm i --save-dev /c/projects/libs/code-tagger/.dist/code-tagger-0.1.0.tgz
```
Check `package.json` for an entry in `devDependencies` like this (exact path may vary depending on the folder where code-tagger was cloned):
```
 "code-tagger": "file:../code-tagger/.dist/code-tagger-0.1.0.tgz",
```
Add to the scripts section in `package.json` the next line:
```
scripts: {
  "codetag": "code-tagger"
}
```
Create a config file in the root folder of you host project `.codetag.json`

When a `.codetag.json` file is present in the root folder of a project using `code-tagger`, the included fields will overwrite the default config. The rest will be taken from default config.