<template>
  <section>
    <ReportFilters />
    <ReportTable v-if="reportStore.isDataLoaded"/>
  </section>
</template>

<script>
import ReportTable from './ReportTable.vue';
import ReportFilters from './ReportFilters.vue';
import { useReportStore } from '@stores/report';

export default {
  name: 'ReportList',
  components: {
    ReportTable,
    ReportFilters
  },
  setup() {
    const reportStore = useReportStore();

    return {
     reportStore,
    }
  }
}
</script>