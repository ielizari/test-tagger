<template>
  <header>
    <h1>Test report</h1>
    <div class="summary__container" v-if="isDataLoaded">
      <div>Created</div>
      <div>{{ metadata.created }}</div>
      <div>File count</div>
      <div>{{ metadata.fileCount }}</div>
      <div>Test count</div>
      <div>{{ metadata.testCount }}</div>
      <div>Skipped tests</div>
      <div>{{ metadata.skipCount }}</div>
    </div>
  </header>
</template>

<script>
import { useReportStore } from '@stores/report';
import { storeToRefs } from 'pinia';

export default {
  name: 'HeaderComponent',
  setup() {
    const reportStore = useReportStore();
    const {
      reportMetadata: metadata,
      isDataLoaded,
    } = storeToRefs(reportStore);

    return {
      metadata,
      isDataLoaded,
    }
  }
}
</script>