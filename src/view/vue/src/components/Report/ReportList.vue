<template>
  <section>
    <ReportFilters
      @changeView="handleView"/>
    <template v-if="isDataLoaded">
      <ReportTable v-if="view==='list'" />
      <ReportTagGraph v-else-if="view==='graph'" />
    </template>
  </section>
</template>

<script>
import { ref } from 'vue';
import ReportTable from './ReportTable.vue';
import ReportFilters from './ReportFilters.vue';
import ReportTagGraph from './ReportTagGraph.vue';
import { useReportStore } from '@stores/report';
import { storeToRefs } from 'pinia';

export default {
  name: 'ReportList',
  components: {
    ReportTable,
    ReportFilters,
    ReportTagGraph,
  },
  setup() {
    const reportStore = useReportStore();
    const { isDataLoaded } = storeToRefs(reportStore);
    const view = ref('list');

    const handleView = (viewName) => {
      view.value = viewName;
    }


    return {
     isDataLoaded,
     view,
     handleView,
    }
  }
}
</script>