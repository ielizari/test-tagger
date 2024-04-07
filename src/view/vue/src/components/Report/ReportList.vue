<template>
  <section>
    <ReportFilters />
    <ReportTable v-if="isDataLoaded"/>
  </section>
</template>

<script>
import ReportTable from './ReportTable.vue';
import ReportFilters from './ReportFilters.vue';
import { useReportStore } from '@stores/report';
import { storeToRefs } from 'pinia';

export default {
  name: 'ReportList',
  components: {
    ReportTable,
    ReportFilters
  },
  setup() {
    const reportStore = useReportStore();
    const { isDataLoaded } = storeToRefs(reportStore);

    return {
     isDataLoaded,
    }
  }
}
</script>