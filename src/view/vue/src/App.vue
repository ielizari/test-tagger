<template>
  <Layout>
    <ReportList />
  </Layout>
</template>

<script>
import Layout from './components/layout/Layout.vue';
import ReportList from './components/Report/ReportList.vue';
import { useReportStore } from '@stores/report';

export default {
  name: 'App',
  components: {
    Layout,
    ReportList,
  },
  setup() {
    const reportStore = useReportStore();
    reportStore.initData();
  }
}
</script>

