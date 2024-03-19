<template>
  <label v-if="label" :for="id">{{ label }}
    <select
      :id="id"
      v-model="selectedOption"
      >
      <option
        v-for="option in options"
        :value="option.value"
        >
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'FormSelect',
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
    }
  },
  emits: ['optionSelected'],
  setup(props, { emit }) {
    const selectedOption = ref(props.options?.[0]?.value);

    watch(selectedOption, (newValue) => {
      emit('optionSelected', newValue);
    });
    return {
      selectedOption,
    }
  }
}
</script>