import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { DISPLAY_TYPES, GROUP_BY_TYPES } from '../components/Report/reportTypes.js';

export const useFiltersStore = defineStore('filers', () => {
  const autotagsEnabled = ref(true);
  const displayType = ref(DISPLAY_TYPES.TREE.value);
  const groupBy = ref(GROUP_BY_TYPES.FILE.value);
  const termsFilter = ref('');
  const currentSkippedTestsData = ref('all');
  const fieldsChecked = ref(['test', 'file', 'modifiers', 'codeTags']);
  const filterCombination = reactive([
    {
      id: 'filterOR',
      label: 'Any',
      value: 'OR',
      checked: true,
    },
    {
      id: 'filterAND',
      label: 'All',
      value: 'AND',
      checked: false,
    },
  ]);

  const setTreeDisplay = () => displayType.value = DISPLAY_TYPES.TREE.value;
  const setFlatDisplay = () => displayType.value = DISPLAY_TYPES.FLAT.value;
  const setDisplayType = (type) => displayType.value = type;
  const setTermsFilter = (terms) => termsFilter.value = terms;
  const setGroupBy = (type) => groupBy.value = type;

  return {
    autotagsEnabled,
    displayType,
    groupBy,
    termsFilter,
    filterCombination,
    fieldsChecked,
    setTreeDisplay,
    setFlatDisplay,
    setDisplayType,
    setTermsFilter,
    setGroupBy,
    currentSkippedTestsData,
  }
});