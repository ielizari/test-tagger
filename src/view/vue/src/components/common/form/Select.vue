<template>
  <div
    class="form-select"
    @keyup.esc="handleClose">
    <div class="selector">
      <span class="selector__label">{{ label }}</span>
      <div class="selector__container">
        <button
          class="selector__selected"
          @click="handleSelectorClick">
          <span class="selector__selected-label">{{ selectedOptionsLabel }}</span>
          <div class="selector__selected-icon arrow down"></div>
        </button>
        <ul
          :class="selectorOptionsClass">
          <li
            v-if="searchbar"
            class="selector__search-bar">
            <FormTextInput
              :id="'filter-input'"ç
              :placeholder="'Search'"
              @update:text="onFilterTextUpdate" />
          </li>
          <li
            v-for="option in filteredOptions"
            :key="`${id}_option_${option.value}`"
            :value="option.value">
            <FormCheckbox
              v-if="multiselect"
              :id="`option_${option.value}`"
              :label="option.label"
              :value="option.value"
              :labelPosition="'right'"
              @checkedState="(checked) => handleOptionChecked(checked, option)"
            />
            <button
              v-else
              class="selector__option"
              @click="handleOptionChecked(true, option)">
              {{ option.label }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';
import FormCheckbox from './Checkbox.vue';
import FormTextInput from './TextInput.vue';

export default {
  name: 'FormSelect',
  components: {
    FormCheckbox,
    FormTextInput,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
      default: [],
    },
    label: {
      type: String,
      required: false,
      default: ''
    },
    defaultSelectedOption : {
      type: String,
      required: false,
      default: null,
    },
    multiselect: {
      type: Boolean,
      required: false,
      default: false,
    },
    searchbar: {
      type: Boolean,
      required: false,
      default: false,
    }
  },
  emits: ['optionSelected'],
  setup(props, { emit }) {
    const optionsSelectorOpen = ref(false);
    const selectedOptions = ref([]);
    const filterText = ref('');

    if (props.defaultSelectedOption) {
      const opt = props.options.find((option) => option.value === props.defaultSelectedOption);
      if (opt) {
        selectedOptions.value.push(opt);
      }
    }

    watch(selectedOptions, (newValue) => {
      emit('optionSelected', newValue);
    }, { deep: true });

    const selectorOptionsClass = computed(() => {
      return {
        'list-container': true,
        open: optionsSelectorOpen.value,
      }
    });

    const filteredOptions = computed(() => {
      return filterText.value ?
        props.options.filter((option) => option.label.includes(filterText.value) )
        : props.options;
    });

    const handleOptionChecked = (checked, option) => {
      if (checked) {
        props.multiselect ? selectedOptions.value.push(option) : selectedOptions.value = [option];
      } else {
        selectedOptions.value = selectedOptions.value.filter((item) => item.value !== option.value);
      };

      if (!props.multiselect) {
        handleClose();
      }
    };

    const handleSelectorClick = (ev) => {
      ev.preventDefault();
      optionsSelectorOpen.value = !optionsSelectorOpen.value;
    };

    const onFilterTextUpdate = (text) => {
      filterText.value = text;
    };

    const handleClose = () => {
      optionsSelectorOpen.value = false;
    }

    const selectedOptionsLabel = computed(() => {
      return selectedOptions.value.map(option => option?.label).join(', ');
    });

    return {
      selectedOptions,
      handleOptionChecked,
      handleSelectorClick,
      selectorOptionsClass,
      optionsSelectorOpen,
      onFilterTextUpdate,
      filteredOptions,
      handleClose,
      selectedOptionsLabel,
    }
  }
}
</script>

<style lang="less" scoped>
.form-select {
  position: relative;
  display: flex;
  flex-direction: column;

  .selector {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;

    &__container {
      position: relative;
    }

    &__option {
      background-color: white;
      color: black;
      border-style: none;
    }

    &__selected {
      position: relative;
      border-style: solid;
      border-width: 1px;
      border-color: var(--secondary-color);
      padding: 0.5rem;
      background-color: transparent;

      &-label {
        margin-right: 20px;
        color: black;
      }

      &-icon {
        border-color: var(--secondary-color);
      }
    }
  }

  ul.list-container {
    display: none;
    position: absolute;
    margin: 0;
    padding: 0;
    left: 0;
    z-index: 10;
    list-style-type: none;
    flex-direction: column;
    border-style: solid;
    border-width: 1px;
    border-color: var(--secondary-color);
    background-color: white;
    align-items: left;
    justify-content: left;
    overflow-x: auto;
    overflow-y: auto;
    max-height: 350px;

    &.open {
      display: flex;
    }

    li {
      display: flex;
      align-items: left;
      color: black;
      padding: 0.3rem;
      white-space: nowrap;
    }
  }
}

</style>