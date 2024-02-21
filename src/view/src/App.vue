<template>
  <ReportFilters />
  <ReportTable />
</template>

<script>
import ReportTable from './components/Report/ReportTable.vue';
import ReportFilters from './components/Report/ReportFilters.vue';
export default {
  name: 'App',
  components: {
    ReportTable,
    ReportFilters
  },
}
</script>

