<template>
  <div ref="table"></div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
import { DISPLAY_TYPES, GROUP_BY_TYPES, SKIPPED_TYPES } from './reportTypes';
import { useFiltersStore } from '@stores/filters.js';
import { useReportStore } from '@stores/report.js';
import { storeToRefs } from 'pinia';

export default {
  name: 'ReportTable',
  setup() {
    const table = ref(null);
    const treeChildField = 'nested';
    const fields = ['test', 'file', 'modifiers', 'codeTags'];
    const filtersStore = useFiltersStore();
    const reportStore = useReportStore();
    const {
      autotagsEnabled,
      displayType,
      setDisplayType,
      groupBy,
      currentSkippedTestsData,
      tagsFilter,
    } = storeToRefs(filtersStore);

    watch(displayType, (newType, oldType) => {
      if (newType !== oldType) {
        if (newType === DISPLAY_TYPES.FLAT.value) {
          reportStore.flatTable(table.value);
        } else if (newType === DISPLAY_TYPES.TREE.value) {
          reportStore.treeTable(table.value);
        }
      }
    }, { inmediate: true });

    watch(groupBy, (newType, oldType) => {
      if(newType !== oldType) {
        if(newType === GROUP_BY_TYPES.FILE.value) {
          if (displayType.value === DISPLAY_TYPES.FLAT.value) {
            reportStore.flatTable(table.value);
          } else if(displayType.value === DISPLAY_TYPES.TREE.value) {
            reportStore.treeTable(table.value);
          }
        } else {
          reportStore.coverageTable(table.value, newType);
        }
      }
    });

    watch(currentSkippedTestsData, (newType, oldType) => {
      if(newType !== oldType) {
        reportStore.applyFilters();
      }
    });

    watch(tagsFilter, (tags) => {
      reportStore.applyFilters();
    }, { deep: true });

    onMounted(() => {
      reportStore.setTable(table.value)
      reportStore.treeTable(table.value);
    })
    return {
      table,
      treeChildField,
      fields,
    }
  }
}
</script>
