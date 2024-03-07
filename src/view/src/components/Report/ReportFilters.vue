<template>
  <div id="table-filters">
    <form id="filter-form">
      <div class="display-options">
        <FormSelect
          :id="'displaySelector'"
          :label="'Display'"
          :options="displayOptions"
          @optionSelected="handleDisplay" />
        <FormSelect
          :id="'groupSelector'"
          :label="'Group by'"
          :options="groupByOptions"
          @optionSelected="handleGroupBy" />
        <FormSelect
          :id="'textExecutionSelector'"
          :label="'Show tests'"
          :options="[
            {label: 'All', value:'all'},
            { label: 'Skipped only', value: 'skipped'},
            { label: 'Not skipped', value: 'not-skipped'}
          ]"
          @optionSelected="handleModifiers" />
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
          <button
            id="show-advanced-filters"
            class="link"
            @click.prevent="toggleAdvancedFilters"
            >
            Advanced filters
          </button>
        </div>
        <div
          v-if="showAdvancedFilters"
          id="filter-advanced">
          <label class="advanced-label" for="enableAutotags">Enable Autotags</label>
          <div class="advanced-content">
            <FormCheckbox
              :id="'enableAutotags'"
              :defaultChecked="true"
              @checkedState="handleAutotagsEnabled" />
          </div>
          <label class="advanced-label" for="filterFields">Target fields</label>
          <div id="filterFileds" class="advanced-content">
            <FormCheckbox
              :id="'field_filter_test'"
              :label="'test'"
              :value="'test'"
              :defaultChecked="true"
              :labelPosition="'right'"
              @checkedState="handleAutotagsEnabled" />
            <FormCheckbox
              :id="'field_filter_file'"
              :label="'file'"
              :value="'file'"
              :defaultChecked="true"
              :labelPosition="'right'"
              @checkedState="handleAutotagsEnabled" />
            <FormCheckbox
              :id="'field_filter_modifiers'"
              :label="'modifiers'"
              :value="'modifiers'"
              :defaultChecked="true"
              :labelPosition="'right'"
              @checkedState="handleAutotagsEnabled" />
            <FormCheckbox
              :id="'field_filter_codetags'"
              :label="'codetags'"
              :value="'codetags'"
              :defaultChecked="true"
              :labelPosition="'right'"
              @checkedState="handleAutotagsEnabled" />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import FormSelect from '../common/form/Select.vue';
import FormTextInput from '../common/form/TextInput.vue';
import RadioGroup from '../common/form/RadioGroup.vue';
import FormCheckbox from '../common/form/Checkbox.vue';
import { DISPLAY_TYPES, GROUP_BY_TYPES } from './reportTypes.js';

export default {
  name: 'ReportFilters',
  components: {
    FormSelect,
    FormTextInput,
    RadioGroup,
    FormCheckbox,
  },
  props: {
    config: {
      type: Object,
      required: true,
    },
    selectedDisplay: {
      type: String,
      required: false,
      default: () => DISPLAY_TYPES.TREE,
    }
  },
  emits: ['displayChange'],
  setup(props, { emit }) {
    const filterText = ref('');
    const showAdvancedFilters = ref(false);
    const enableAutotags = ref(true);
    const displayOptions = [
      DISPLAY_TYPES.TREE,
      DISPLAY_TYPES.FLAT
    ];
    const groupByOptions = [
      GROUP_BY_TYPES.FILE,
      GROUP_BY_TYPES.FUNCTIONALITY,
    ]
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

    const handleDisplay = (type) => {
      emit('displayChange', type);
    }

    const handleGroupBy = (type) => {

    }

    const handleModifiers = (type) => {

    }

    const handleAutotagsEnabled = (isChecked) => {
      enableAutotags.value = isChecked;
    }

    const toggleAdvancedFilters = () => {
      showAdvancedFilters.value = !showAdvancedFilters.value;
    }

    const filtersState = computed(() => {
      const state = {
        autotags: enableAutotags.value,

      }
      return state;
    });

    return {
      filterText,
      showAdvancedFilters,
      displayOptions,
      groupByOptions,
      radioOptions,
      onFilterTextUpdate,
      onFilterOptionChecked,
      handleDisplay,
      handleGroupBy,
      handleModifiers,
      toggleAdvancedFilters,
      handleAutotagsEnabled,
    }

  }
}
</script>