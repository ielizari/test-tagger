<template>
  <Layout>
    <ReportList :reportData="reportData"/>
  </Layout>
</template>

<script>
import { ref } from 'vue';
import Layout from './components/layout/Layout.vue';
import ReportList from './components/Report/ReportList.vue';
import data from '@report/data.json';

export default {
  name: 'App',
  components: {
    Layout,
    ReportList,
  },
  setup() {
    const reportData = ref(data);

    return {
      reportData,
    }
  }
}
</script>

