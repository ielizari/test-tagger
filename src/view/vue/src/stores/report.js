import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DISPLAY_TYPES, GROUP_BY_TYPES } from '../components/Report/reportTypes.js';
//import data from '@report/data.json';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import {
  descriptionFormatter,
  modifiersFieldFormatter,
  tagFieldFormatter,
  coverageRowFormatter,
  coverageDescriptionFormatter,
  coverageModifiersFieldFormatter,
  coverageTagFieldFormatter,
} from '@utils/tabulator.formatters';
import { useFiltersStore } from '@stores/filters.js';
import { storeToRefs } from 'pinia';

export const useReportStore = defineStore('report', () => {
  const filtersStore = useFiltersStore();
  const {
    autotagsEnabled,
    termsFilter,
    currentSkippedTestsData,
    filterCombination,
    fieldsChecked
  } = storeToRefs(filtersStore);

  const table = ref(null);
  const testsData = ref(null);
  const coverageData = ref([]);
  const reportConfig = ref(null);
  const report = ref(null);
  const treeChildField = 'nested';
  const fields = ['test', 'file', 'modifiers', 'codeTags'];
  const formatterParams = computed(() => {
    return {
      currentDisplayData: DISPLAY_TYPES.TREE.value,
      filterAutotags: autotagsEnabled.value,
    }
  });

  const initData = () => {
    testsData.value = window.reportData.data;
    reportConfig.value = window.reportData.config;
    coverageData.value = getFunctionalityReportData();
  }

  const getTestCoverageMatch = (testList, level) => {
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
  };

  const createLevel = (level) => {
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
  };

  const checkIfTestMatchesCoverageLevel = (test, level) => {
    return level.tags?.length && level.tags.every((tagGroup) => {
      return test.tags.some((testTag) => {
        if (testTag.auto && !autotagsEnabled.value?.checked) {
          return false;
        }
        return Array.isArray(tagGroup) ? tagGroup.includes(testTag.name) : tagGroup === testTag.name;
      });
    });
  };

  const getFunctionalityReportData = () => {
    if (!Array.isArray(reportConfig.value.coverage)) return;
    const tests = flattenTests(testsData.value);
    const coverageData = reportConfig.value?.coverage?.map((item) => getTestCoverageMatch(tests, item)) ?? [];
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
  };

  const setTable = (tableElement) => {
    table.value = tableElement;
  }

  const treeTable = (el) => {
    report.value = new Tabulator(el, {
      data: testsData.value,
      reactiveData: true,
      dataTree: true,
      dataTreeStartExpanded: true,
      dataTreeChildField: treeChildField,
      layout: "fitColumns",
      pagination: "local",
      paginationSize:50,
      history: true,
      groupBy: 'file',
      columns:[
        {title:"Description", field:"test", variableHeight: true, widthGrow:2, formatter: descriptionFormatter, formatterParams: formatterParams.value},
        {title:"Modifiers", field:"modifiers", width:150, widthShrink:2, formatter: modifiersFieldFormatter, formatterParams: formatterParams.value},
        {title:"Tags", field:"tags", widthGrow:1, formatter: tagFieldFormatter, formatterParams: formatterParams.value},
      ],
    });
  }

  const flatTable = (el) => {
    report.value = new Tabulator(el, {
      data: flattenTests(testsData.value),
      layout: "fitColumns",
      pagination: "local",
      paginationSize:50,
      history: true,
      groupBy: 'file',
      columns:[
        {title:"Description", field:"test", variableHeight: true, widthGrow:2, formatter: descriptionFormatter, formatterParams: formatterParams.value},
        {title:"Modifiers", field:"modifiers", width:150, widthShrink:2, formatter: modifiersFieldFormatter, formatterParams: formatterParams.value},
        {title:"Tags", field:"tags", widthGrow:1, formatter: tagFieldFormatter, formatterParams: formatterParams.value},
      ],
    });
  };

  const coverageTable = (el) => {
    report.value = new Tabulator(el, {
      data: coverageData.value,
      dataTree: true,
      dataTreeStartExpanded: true,
      dataTreeChildField: treeChildField,
      layout: "fitColumns",
      pagination: "local",
      paginationSize:50,
      history: true,
      rowFormatter: coverageRowFormatter,
      columns:[
        {title:"Description", field:"test", variableHeight: true, widthGrow:2, formatter: coverageDescriptionFormatter, formatterParams: formatterParams.value},
        {title:"Modifiers", field:"modifiers", width:150, widthShrink:2, formatter: coverageModifiersFieldFormatter, formatterParams: formatterParams.value},
        {title:"Tags", field:"tags", widthGrow:1, formatter: coverageTagFieldFormatter, formatterParams: formatterParams.value},
      ],
    });
  }

  const isTest = (item) => {
    return ['it', 'test'].includes(item.name);
  }
  const flattenTests = (data, addParentLabels = true, parentLabel) => {
    return data.reduce((flatTests, item) => {
      const test = {...item};

      if (addParentLabels) {
        test.parentLabels = parentLabel?.map((label) => label) || [];
      }

      if (isTest(test)) {
        flatTests.push(test);
      } else {
        if (test.nested?.length) {
          flatTests = flatTests.concat(flattenTests(test.nested, addParentLabels, test.parentLabels.concat(test.test)));
        }
      }
      return flatTests;
    }, []);
  }

  const applyFilters = () => {
    if (!table.value) return;
    report.value.clearFilter();
    report.value.addFilter(filterSkipped);
    if(!termsFilter.value) return;

    const filters = termsFilter.value.split(' ');
    if (autotagsEnabled.value) {
      fieldsChecked.value = fieldsChecked.value.concat(['autoTags'])
    }

    report.value.addFilter(filterTree, filters);
  }

  const filterSkipped = (data) => {
    if(currentSkippedTestsData === 'skipped' && !data.skipped) return false;
    if(currentSkippedTestsData === 'not-skipped' && data.skipped) return false;
    return true;
  }

  const filterTree = (data, words) => {
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

  const isMatch = (data, words) => {
    const matches = words.map((word) => {
      for (const field of fieldsChecked.value) {
        if (data[field].includes(word)) {
          return true;
        }
      }
      return false;
    });

    return filterCombination.value.value === 'OR' ? matches.some((match) => match) : matches.every((match) => match);
  }

  return {
    table,
    testsData,
    reportConfig,
    report,
    initData,
    setTable,
    treeTable,
    flatTable,
    coverageTable,
    applyFilters,
  }
});