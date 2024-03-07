<template>
  <div ref="table"></div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { descriptionFormatter, modifiersFieldFormatter, tagFieldFormatter } from './tabulator.formatters';
import { DISPLAY_TYPES } from './reportTypes';

export default {
  name: 'ReportTable',
  props: {
    testData: {
      type: Object,
      required: true,
    },
    displayType: {
      type: String,
      required: false,
      default: () => DISPLAY_TYPES.TREE.value,
    },
  },
  setup(props) {
    const tabulator = ref(null);
    const table = ref(null);
    const treeChildField = 'nested';
    const fields = ['test', 'file', 'modifiers', 'codeTags'];
    const formatterParams = ref({
      currentDisplayData: DISPLAY_TYPES.TREE.value,
    })

    watch(() => props.displayType, (newType, oldType) => {
      if (newType !== oldType) {
        if (newType === DISPLAY_TYPES.FLAT.value) {
          tabulator.value = flatTable();
        } else if (newType === DISPLAY_TYPES.TREE.value) {
          tabulator.value = treeTable();
        }
      }
    }, { inmediate: true })

    const treeTable = () => {
      return new Tabulator(table.value, {
        data: props.testData,
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
      });
    }

    const flatTable = () => {
      return new Tabulator(table.value, {
        data: flattenTests(props.testData),
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
      });
    }

    const isTest = (item) => {
      return ['it', 'test'].includes(item.name);
    }
    const flattenTests = (data, addParentLabels = true, parentLabel) => {
      return data.reduce((flatTests, item) => {
        const test = {...item};

        if (addParentLabels) {
          test.parentLabels = parentLabel?.map((label) => label) || [];
        }

        if (isTest(test)) {
          flatTests.push(test);
        } else {
          if (test.nested?.length) {
            flatTests = flatTests.concat(flattenTests(test.nested, addParentLabels, test.parentLabels.concat(test.test)));
          }
        }
        return flatTests;
      }, []);
    }

    onMounted(() => {
      tabulator.value = treeTable();
    })
    return {
      tabulator,
      table,
      treeChildField,
      fields,
      formatterParams,
    }

  }
}
</script>
