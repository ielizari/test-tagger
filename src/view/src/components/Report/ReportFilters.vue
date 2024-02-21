<template>
  <div id="table-filters">
    <form id="filter-form">
      <div class="display-options">
        <FormSelect
          :id="'displaySelector'"
          :label="'Display'"
          :options="[
            {label: 'Tree', value:'tree'},
            { label: 'Flat', value: 'flat'}
          ]"/>
        <FormSelect
          :id="'groupSelector'"
          :label="'Group by'"
          :options="[
            {label: 'File', value:'file'},
            { label: 'Functionality', value: 'functionality'}
          ]"/>
        <FormSelect
          :id="'textExecutionSelector'"
          :label="'Show tests'"
          :options="[
            {label: 'All', value:'all'},
            { label: 'Skipped only', value: 'skipped'},
            { label: 'Not skipped', value: 'not-skipped'}
          ]"/>
      </div>
      <div class="filter-options">
        <div>
          <FormTextInput
            :id="'filter-input'"
            @update:text="onFilterTextUpdate"
          />
          <button
            id="filterApply"
            type="submit"
            @click.prevent="onSubmit"
          >
            Filter
          </button>
        </div>
        <div>
          <RadioGroup
            :groupName="'filterCombination'"
            :options="radioOptions"
            @optionChecked="onFilterOptionChecked"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import FormSelect from '../common/form/Select.vue';
import FormTextInput from '../common/form/TextInput.vue';
import RadioGroup from '../common/form/RadioGroup.vue';

export default {
  name: 'ReportFilters',
  components: {
    FormSelect,
    FormTextInput,
    RadioGroup,
  },
  setup() {
    const filterText = ref('');
    const radioOptions = reactive([
      {
        id: 'filterOR',
        label: 'Any',
        value: 'OR',
        checked: true,
      },
      {
        id: 'filterAND',
        label: 'All',
        value: 'AND',
        checked: false,
      },
    ]);
    const onFilterTextUpdate = (text) => {
      filterText.value = text;
    }

    const onFilterOptionChecked = (optionChecked) => {
      radioOptions.forEach((option) => {
        option.checked = optionChecked.id === option.id;
      });
    }

    return {
      filterText,
      radioOptions,
      onFilterTextUpdate,
      onFilterOptionChecked,
    }

  }
}
</script>