# Test Tag
## 1. Overview
A javascript static analysis tool for automated code documentation. The main difference with other related popular libraries like jsdoc is that test-tag is focused on tagging function calls instead of function declarations.

### 1.1 Developers
If you are interested in improving this library for your own use, or even willing to share it with the rest of us, check this [developers link](README_DEVELOPERS.md) for more info

## 2.Usage
### 2.1 Installation
Add test-tag to yout project as a develorper dependency
```
npm i --save-dev test-tag
```
Add command to `package.json` in order to execute report
```
scripts: {
  testtag: 'test-tag'
}
```
### 2.2 Configure
#### 2.2.1 Default configuration
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
  "profiles": []
}
```
#### 2.2.2 Custom configuration
In order to create a custom configuration

### 2.3 Create report
Run the previously created script to generate project report
```
npm run testag
```