<template>
  <section>
    <ReportFilters />
    <ReportTable />
  </section>
</template>

<script>
import ReportTable from './ReportTable.vue';
import ReportFilters from './ReportFilters.vue';

export default {
  name: 'ReportList',
  components: {
    ReportTable,
    ReportFilters
  },
}
</script>