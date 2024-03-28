<template>
  <header>
    <h1>Test report</h1>
    <div class="summary__container" v-if="reportStore.isDataLoaded">
      <div>Created</div>
      <div>{{ reportStore.reportMetadata.created }}</div>
      <div>File count</div>
      <div>{{ reportStore.reportMetadata.fileCount }}</div>
      <div>Test count</div>
      <div>{{ reportStore.reportMetadata.testCount }}</div>
      <div>Skipped tests</div>
      <div>{{ reportStore.reportMetadata.skipCount }}</div>
    </div>
  </header>
</template>

<script>
import { useReportStore } from '@stores/report';

export default {
  name: 'HeaderComponent',
  setup() {
    const reportStore = useReportStore();
    return {
      reportStore,
    }
  }
}
</script>