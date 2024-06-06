<template>
  <div id="table-filters">
    <form id="filter-form" @submit.prevent>
      <div class="display-options">
        <FormSelect
          :id="'viewSelector'"
          :label="'View'"
          :options="viewOptions"
          :defaultSelectedOption="VIEW_TYPES.LIST.value"
          @optionSelected="handleView" />
        <FormSelect
          :id="'displaySelector'"
          :label="'Display'"
          :options="displayOptions"
          :defaultSelectedOption="DISPLAY_TYPES.TREE.value"
          @optionSelected="handleDisplay" />
        <FormSelect
          :id="'groupSelector'"
          :label="'Group by'"
          :options="groupByOptions"
          :defaultSelectedOption="GROUP_BY_TYPES.FILE.value"
          @optionSelected="handleGroupBy" />
        <FormSelect
          :id="'textExecutionSelector'"
          :label="'Show tests'"
          :options="skippedOptions"
          :defaultSelectedOption="SKIPPED_TYPES.ALL.value"
          @optionSelected="handleModifiers" />
        <FormSelect
          v-if="tagOptions"
          :id="'tagsFilter'"
          :label="'Tags'"
          :multiselect="true"
          :searchbar="true"
          :options="tagOptions"
          @optionSelected="handleTags" />
      </div>
      <div class="filter-options">
        <div>
          <FormTextInput
            :id="'filter-input'"
            @update:text="onFilterTextUpdate"
          />
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
import { VIEW_TYPES, DISPLAY_TYPES, GROUP_BY_TYPES, SKIPPED_TYPES, mapGroupByCoverage } from './reportTypes.js';
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
  emits: ['changeView'],
  setup(props, { emit }) {
    const filterText = ref('');
    const showAdvancedFilters = ref(false);
    const filtersStore = useFiltersStore();
    const reportStore = useReportStore();
    const { autotagsEnabled, filterCombination } = storeToRefs(filtersStore);
    const { setDisplayType, setGroupBy, setModifiersFilter, setTagsFilter } = filtersStore;
    const { reportConfig, coverageSummaries, reportMetadata } = storeToRefs(reportStore);
    const viewOptions = [
      VIEW_TYPES.LIST,
      VIEW_TYPES.GRAPH,
    ]
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

    const skippedOptions = computed(() => {
      return [
        SKIPPED_TYPES.ALL,
        SKIPPED_TYPES.SKIPPED,
        SKIPPED_TYPES.NOT_SKIPPED,
      ]
    });

    const tagOptions = computed(() => {
      return reportMetadata.value?.tagList?.map((tag) => {
        return {
          label: tag,
          value: tag,
        }
      });
    });

    const handleTags = (tags) => {
      setTagsFilter(tags)
    }

    const onFilterTextUpdate = (text) => {
      filterText.value = text;
      onSubmit();
    }

    const onFilterOptionChecked = (optionChecked) => {
      filterCombination.value.forEach((option) => {
        option.checked = optionChecked.id === option.id;
      });
    }

    const handleView = (type) => {
      emit('changeView', type[0].value);
    };

    const handleDisplay = (type) => {
      setDisplayType(type[0].value);
    }

    const handleGroupBy = (type) => {
      setGroupBy(type[0].value);
    }

    const handleModifiers = (type) => {
      setModifiersFilter(type[0].value)
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
      viewOptions,
      displayOptions,
      groupByOptions,
      skippedOptions,
      tagOptions,
      filterCombination,
      onFilterTextUpdate,
      onFilterOptionChecked,
      handleView,
      handleDisplay,
      handleGroupBy,
      handleModifiers,
      toggleAdvancedFilters,
      handleAutotagsEnabled,
      onSubmit,
      handleTags,
      DISPLAY_TYPES,
      GROUP_BY_TYPES,
      SKIPPED_TYPES,
      VIEW_TYPES,
    }

  }
}
</script>