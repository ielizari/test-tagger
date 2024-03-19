# test-tagger for developers
## 1. Installation
Clone the project
```
git clone git@github.com:ielizari/test-tagger.git
```
Move inside the newly created folder
```
cd test-tagger
```
Install dependencies
```
npm i
```
Create test report of test-tagger
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
### 2.1 Build test-tagger as module
In test-tagger project folder, run next command in order to pack the project
```
npm run build
```
A `.dist` folder must have been created in the project containing a `test-tagger-<version>.tgz` file.

### 2.2 Installation in host project
Get the full path in your system to the tgz file created in previous step. This path must be in a format including forward slashes for directories. For exmple, in a Windows system the path `C:\projects\libs\test-tagger\.dist\test-tagger-0.1.0.tgz` should be formated as `/c/projects/libs/test-tagger/.dist/test-tagger-0.1.0.tgz`

Move to your host project where you want to try `test-tagger` and run the next command to install `test-tagger` from a local project
```
npm i --save-dev /c/projects/libs/test-tagger/.dist/test-tagger-0.1.0.tgz
```
Check `package.json` for an entry in `devDependencies` like this (exact path may vary depending on the folder where test-tagger was cloned):
```
 "test-tagger": "file:../test-tagger/.dist/test-tagger-0.1.0.tgz",
```
Add to the scripts section in `package.json` the next line:
```
scripts: {
  "testag": "test-tagger"
}
```
Create a config file in the root folder of you host project `.testag.json`

When a `.testag.json` file is present in the root folder of a project using `test-tagger`, the included fields will overwrite the default config. The rest will be taken from default config.

## 3. Vue UI
Run:
```
npm run ui-dev
```
In your browser go to http://localhost:51173/

Build vue ui template to be included in the module. This command will generate a single index.html file with a script tag declaring a string variable that is used as a placeholder. This placeholder will be replaced by the tests data when test-tagger command is run.
```
npm run ui-build
```
This will create the file `src/view/vue/dist/index.html`

Then, execute test-tagger command to generate the tests report.
```
npm run app
```
This will create a 'report' folder and include the data.json in the index.html file created in this folder. Now you can open index.html in a browser to see the full ui with the data, all contained in a single html file.