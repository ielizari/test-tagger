<template>
  <section>
    <ReportFilters
      :config="reportData?.config"
      :selectedDisplay="displayType"
      @displayChange="handleDisplay"
    />
    <ReportTable
      :testData="reportData.data"
      :displayType="displayType"
    />
  </section>
</template>

<script>
import { computed, ref } from 'vue';
import ReportTable from './ReportTable.vue';
import ReportFilters from './ReportFilters.vue';
import { DISPLAY_TYPES } from './reportTypes';

export default {
  name: 'ReportList',
  components: {
    ReportTable,
    ReportFilters
  },
  props: {
    reportData: {
      type: Object,
      required: true,
      default: () => {},
    }
  },
  setup(props) {
    const displayType = ref(DISPLAY_TYPES.TREE.value);

    const handleDisplay = (type) => {
      displayType.value = type;
    };

    return {
      displayType,
      handleDisplay,
    }
  }

}
</script>