<template>
  <div ref="table"></div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import data from '@report/data.json';
import { descriptionFormatter, modifiersFieldFormatter, tagFieldFormatter } from './tabulator.formatters';

const DISPLAY = Object.freeze({
  TREE: 'tree',
  FLAT: 'flat'
})
export default {
  name: 'ReportTable',
  setup() {
    const tabulator = ref(null);
    const tableData = ref(data);
    const table = ref(null);
    const treeChildField = 'nested';
    const fields = ['test', 'file', 'modifiers', 'codeTags'];
    const formatterParams = ref({
      currentDisplayData: DISPLAY.TREE,
    })

    onMounted(() => {
      tabulator.value = new Tabulator(table.value, {
        data: tableData.value,
        reactiveData: true,
        dataTree: true,
        dataTreeStartExpanded: true,
        dataTreeChildField: treeChildField,
        layout: "fitColumns",
        pagination: "local",
        paginationSize:50,
        history: true,
        groupBy: 'file',
        columns:[
          {title:"Description", field:"test", variableHeight: true, widthGrow:2, formatter: descriptionFormatter, formatterParams: formatterParams.value},
          {title:"Modifiers", field:"modifiers", width:150, widthShrink:2, formatter: modifiersFieldFormatter},
          {title:"Tags", field:"tags", widthGrow:1, formatter: tagFieldFormatter},
        ],
      })
    })
    return {
      tabulator,
      tableData,
      table,
      treeChildField,
      fields,
      formatterParams,
    }

  }
}
</script>
