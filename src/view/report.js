window.onload = () => {
  const treeChildField = 'nested';
  const fields = ['test', 'file', 'modifiers', 'codeTags'];
  let table;
  let coverageData;
  let tableData;
  let currentGroupData = 'file';
  let currentDisplayData = 'tree';
  let initializedControls = false;
  let filterForm;
  let fieldsFilterApply;
  let fieldsContainer;
  let fieldsFilterElements;
  let fieldsChecked;
  let filterInput;
  let filterCombination;
  let filterAutotags;
  let filterAdvancedContainer;
  let filterAdvancedBtn;
  let filterDisplay;
  let filterGroup;
  let summaryFiles;
  let summaryTests;
  let summarySkipped;

  const isMatch = (data, words) => {
    const matches = words.map((word) => {
      for (const field of fieldsChecked) {
        if (data[field].includes(word)) {
          return true;
        }
      }
      return false;
    });

    return filterCombination === 'OR' ? matches.some((match) => match) : matches.every((match) => match);
  }

  const filterTree = function (data, words) {
    if(!words || (Array.isArray(words) && !words.length)) return true;

    if(isMatch(data, words)) return true;
    if (data[treeChildField] && data[treeChildField].length > 0) {
      for (let i=0; i< data[treeChildField].length; i++) {
        const childOK = filterTree(data[treeChildField][i], words);
        if(childOK) return true;
      }
    }
    return false;
  };


  const createFieldFilters = () => {
    const fieldsContainer = document.getElementById('filterFields');
    // const columns = Object.values(table.getColumns()).map((col) => {
    //   const { title, field } = col._column.definition;
    //   return { title, field };
    // });
    fieldsFilterElements = [];
    fields.forEach((fieldName) => {
      const container = document.createElement('label');
      const checkbox = document.createElement('input');
      const labelText = document.createTextNode(fieldName);
      checkbox.type = 'checkbox';
      checkbox.id = 'field_filter_' + fieldName;
      checkbox.value = fieldName;
      checkbox.name = 'fieldsFilter';
      checkbox.checked = true;
      fieldsFilterElements.push(checkbox);
      container.appendChild(checkbox);
      container.appendChild(labelText);
      fieldsContainer.appendChild(container);
    });
  }

  const createTagNode = (cell, isTag = true) => {
    const cellContainer = document.createElement('div');
    cellContainer.classList = 'tag-container';
    const nodes = cell.getValue().map((tag) => {
      if (tag.auto && filterAutotags && !filterAutotags.checked) {
        return;
      }
      const tagContainer = document.createElement('div');
      const text = document.createTextNode(isTag ? tag.name : tag);
      tagContainer.classList.add('tag');
      if (tag.auto) {
        tagContainer.classList.add('tag-auto');
      }
      tagContainer.appendChild(text);
      return tagContainer;
    }).filter((node) => node);
    nodes.forEach((node) => {
      cellContainer.appendChild(node);
    });
    return cellContainer;
  }

  const tagFieldFormatter = (cell, formatterParams, onRendered) => {
    return createTagNode(cell, true);
  }

  const modifiersFieldFormatter = (cell, formatterParams, onRendered) => {
    return createTagNode(cell, false);
  }

  const descriptionFormatter = (cell, formatterParams, onRendered) => {
    const data = cell.getData();
    const value = cell.getValue();
    const description = currentDisplayData === 'tree' ? value : data.parentLabels.concat(value).join(' > ');
    return data.itemCount.items ? `${value} (${data.itemCount.items} items ${data.itemCount.tests} tests)` : description;
  }

  const coverageTagFieldFormatter = (cell, formatterParams, onRendered) => {
    const data = cell.getData();
    return data.label ? '' : createTagNode(cell, true);
  }

  const coverageModifiersFieldFormatter = (cell, formatterParams, onRendered) => {
    const data = cell.getData();
    return  data.label ? '' : createTagNode(cell, false);
  }

  const coverageDescriptionFormatter = (cell, formatterParams, onRendered) => {
    const data = cell.getData();
    const value = cell.getValue();
    return data.label ? `${data.label}  (${data.itemCount.tests} tests / ${data.itemCount.skipped} skipped)` : data.parentLabels.concat(value).join(' > ');
  }

  const coverageRowFormatter = (row) => {
    const data = row.getData();
    if (data.label) {
      let style = row.getElement().style
      style.backgroundColor = '#ffe396';
      style.fontWeight = 'bold';
    }
  }

  tableData = reportData;
  renderTable();

  function initControls () {
    const summary = getSummary(reportData)
    summaryFiles = document.getElementById('summary-files');
    summaryFiles.textContent = summary.fileCount;
    summaryTests = document.getElementById('summary-test-count');
    summaryTests.textContent = summary.testCount;
    summarySkipped = document.getElementById('summary-skipped');
    summarySkipped.textContent = summary.skipCount;

    filterForm = document.getElementById('filter-form');
    fieldsFilterDropdown = document.getElementById('filter-fields-dropdown');

    fieldsContainer = document.getElementById('filterFields');
    createFieldFilters();

    filterInput = document.getElementById('filter-input');
    filterInput.value = "";
    filterAutotags = document.getElementById('enableAutotags');
    filterAutotags.checked = true;

    filterAdvancedContainer = document.getElementById('filter-advanced');
    filterAdvancedBtn = document.getElementById('show-advanced-filters');
    filterAdvancedBtn.addEventListener('click', (event) => {
      filterAdvancedContainer.classList.toggle('hidden');
    });

    filterAutotags.addEventListener('change', (event) => {
      table.replaceData(tableData)
    });

    filterDisplay = document.getElementById('displaySelector');
    filterDisplay.addEventListener('change', (event) => {
      currentDisplayData = event.target.value;
      renderTable();
    });

    filterGroup = document.getElementById('groupSelector');
    filterGroup.addEventListener('change', (event) => {
      currentGroupData = event.target.value;
      renderTable();
    })

    fieldsFilterApply = document.getElementById('filter-apply');
    filterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const filterText = filterInput.value;
      table.clearFilter();
      if(!filterText) return;

      filterCombination = document.querySelector('input[name="filterCombination"]:checked').value;

      const filters = filterText.split(' ');
      fieldsChecked = [...fieldsContainer.querySelectorAll('input[name=fieldsFilter]:checked')]
        .map((node) => node.value);
      if (filterAutotags.checked) {
        fieldsChecked = fieldsChecked.concat(['autoTags'])
      }

      table.setFilter(filterTree, filters)
    });

    initializedControls = true;
  }

  function getSummary (data) {
    const fileCount = data.length;
    let testCount = 0;
    let skipCount = 0;

    data.forEach((file) => {
      testCount += file.itemCount.tests;
      skipCount += file.itemCount.skipped;
    });

    return {
      fileCount,
      testCount,
      skipCount,
    }
  }

  function isTest (item) {
    return ['it', 'test'].includes(item.name);
  }
  function flattenTests (data, addParentLabels = true, parentLabel) {
    let flatTests = [];
    data.forEach((item) => {
      if (addParentLabels) {
        item.parentLabels = parentLabel?.map((label) => label) || [];
      }

      if (isTest(item)) {
        flatTests.push(item);
      } else {
        if (item.nested?.length) {
          flatTests = flatTests.concat(flattenTests(item.nested, addParentLabels, item.parentLabels.concat(item.test)));
        }
      }
    });

    return flatTests;
  }

  function treeTable () {
    return new Tabulator("#data-table", {
      //height: "500px",
      data: tableData,
      dataTree: true,
      dataTreeStartExpanded: true,
      dataTreeChildField: treeChildField,
      layout: "fitColumns",
      pagination: "local",
      paginationSize:50,
      history: true,
      groupBy: 'file',
      columns:[
        {title:"Description", field:"test", variableHeight: true, widthGrow:2, formatter: descriptionFormatter},
        {title:"Modifiers", field:"modifiers", width:150, widthShrink:2, formatter: modifiersFieldFormatter},
        {title:"Tags", field:"tags", widthGrow:1, formatter: tagFieldFormatter},
      ],
    });
  }

  function flatTable() {
    return new Tabulator("#data-table", {
      data: flattenTests(tableData),
      layout: "fitColumns",
      pagination: "local",
      paginationSize:50,
      history: true,
      groupBy: 'file',
      columns:[
        {title:"Description", field:"test", variableHeight: true, widthGrow:2, formatter: descriptionFormatter},
        {title:"Modifiers", field:"modifiers", width:150, widthShrink:2, formatter: modifiersFieldFormatter},
        {title:"Tags", field:"tags", widthGrow:1, formatter: tagFieldFormatter},
      ],
    });
  }

  function coverageTable() {
    return new Tabulator("#data-table", {
      //height: "500px",
      data: coverageData,
      dataTree: true,
      dataTreeStartExpanded: true,
      dataTreeChildField: treeChildField,
      layout: "fitColumns",
      pagination: "local",
      paginationSize:50,
      history: true,
      rowFormatter: coverageRowFormatter,
      columns:[
        {title:"Description", field:"test", variableHeight: true, widthGrow:2, formatter: coverageDescriptionFormatter},
        {title:"Modifiers", field:"modifiers", width:150, widthShrink:2, formatter: coverageModifiersFieldFormatter},
        {title:"Tags", field:"tags", widthGrow:1, formatter: coverageTagFieldFormatter},
      ],
    });
  }

  function renderTable() {
    if(currentGroupData === 'file') {
      tableData = reportData;
    } else if(currentGroupData === 'functionality') {
      tableData = coverageData ? coverageData : getFunctionalityReportData();
    }

    if (currentGroupData === 'functionality') {
      table = coverageTable();
    } else {
      if (currentDisplayData === 'flat') {
        table = flatTable();
      } else if (currentDisplayData === 'tree') {
        table = treeTable();
      }
    }

    if (!initializedControls) {
      table.on("tableBuilt", () => {
        initControls();
      });
    }
  }

  function getFunctionalityReportData() {
    if (!Array.isArray(reportCfg.coverage)) return;
    const tests = flattenTests(reportData);
    coverageData = reportCfg.coverage.map((item) => getTestCoverageMatch(tests, item));
    const unmatchedTests = tests.filter((test) => !test.matchedCoverage);
    if (unmatchedTests.length) {
      coverageData.push({
        label: 'Unmatched tests',
        nested: unmatchedTests,
        itemCount: {
          tests: unmatchedTests.length,
          skipped: unmatchedTests.filter((test) => test.skipped).length,
        }
      })
    }
    return coverageData;
  }

  function createLevel (level) {
    const { label, tags } = level;
    return {
      label,
      tags,
      nested: [],
      itemCount: {
        tests: 0,
        skipped: 0,
      }
    }
  }

  function checkIfTestMatchesCoverageLevel (test, level) {
    return level.tags?.length && level.tags.every((tagGroup) => {
      return test.tags.some((testTag) => {
        if (testTag.auto && filterAutotags && !filterAutotags.checked) {
          return false;
        }
        return Array.isArray(tagGroup) ? tagGroup.includes(testTag.name) : tagGroup === testTag.name;
      });
    });
  }

  function getTestCoverageMatch (testList, level) {
    const resultLevel = createLevel(level);
    const matchedTests = testList.filter((test) => {
      const matchTest = checkIfTestMatchesCoverageLevel(test, level);
      if (!level.children && matchTest) {
        test.matchedCoverage = true;
      }
      return matchTest;
    });

    if (level.children) {
      resultLevel.nested = level.children.map((sublevel) => getTestCoverageMatch(matchedTests, sublevel));
      let testCount = 0;
      let testSkipped = 0;
      resultLevel.nested.forEach((item) => {
        testCount += item.itemCount.tests;
        testSkipped += item.itemCount.skipped;
      });
      resultLevel.itemCount = {
        tests: testCount,
        skipped: testSkipped,
      }
    } else {
      resultLevel.nested = matchedTests;
      resultLevel.itemCount.tests = matchedTests.length;
    }

    return resultLevel;
  }
}


