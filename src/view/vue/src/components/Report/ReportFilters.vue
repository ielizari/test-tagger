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
            { label: 'All', value:'all'},
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
            :options="filterCombination"
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
import { ref, computed } from 'vue';
import FormSelect from '../common/form/Select.vue';
import FormTextInput from '../common/form/TextInput.vue';
import RadioGroup from '../common/form/RadioGroup.vue';
import FormCheckbox from '../common/form/Checkbox.vue';
import { DISPLAY_TYPES, GROUP_BY_TYPES, mapGroupByCoverage } from './reportTypes.js';
import { useFiltersStore } from '@stores/filters.js';
import { useReportStore } from '@stores/report.js';
import { storeToRefs } from 'pinia';

export default {
  name: 'ReportFilters',
  components: {
    FormSelect,
    FormTextInput,
    RadioGroup,
    FormCheckbox,
  },
  setup() {
    const filterText = ref('');
    const showAdvancedFilters = ref(false);
    const filtersStore = useFiltersStore();
    const reportStore = useReportStore();
    const { autotagsEnabled, filterCombination } = storeToRefs(filtersStore);
    const { setDisplayType, setGroupBy } = filtersStore;
    const { reportConfig, coverageSummaries } = storeToRefs(reportStore);
    const displayOptions = [
      DISPLAY_TYPES.TREE,
      DISPLAY_TYPES.FLAT
    ];
    const groupByOptions = computed(() => {
      return [
        GROUP_BY_TYPES.FILE,
        ...(coverageSummaries.value.map(mapGroupByCoverage) ?? []),
      ];
    });

    const onFilterTextUpdate = (text) => {
      filterText.value = text;
    }

    const onFilterOptionChecked = (optionChecked) => {
      filterCombination.value.forEach((option) => {
        option.checked = optionChecked.id === option.id;
      });
    }

    const handleDisplay = (type) => {
      setDisplayType(type);
    }

    const handleGroupBy = (type) => {
      setGroupBy(type);
    }

    const handleModifiers = (type) => {

    }

    const handleAutotagsEnabled = (isChecked) => {
      autotagsEnabled.value = isChecked;
    }

    const toggleAdvancedFilters = () => {
      showAdvancedFilters.value = !showAdvancedFilters.value;
    }

    const onSubmit = () => {
      filtersStore.setTermsFilter(filterText.value);
      reportStore.applyFilters();
    }

    return {
      reportConfig,
      filterText,
      showAdvancedFilters,
      displayOptions,
      groupByOptions,
      filterCombination,
      onFilterTextUpdate,
      onFilterOptionChecked,
      handleDisplay,
      handleGroupBy,
      handleModifiers,
      toggleAdvancedFilters,
      handleAutotagsEnabled,
      onSubmit,
    }

  }
}
</script>