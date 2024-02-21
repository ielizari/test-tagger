<template>
  <label :for="option.id">
    <input
      :id="option.id"
      type="radio"
      :name="groupName"
      :value="option.value"
      v-model="checked"
      @change="onChange"
      />
      {{ option.label }}
  </label>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'RadioButton',
  emits: ['update:checked'],
  props: {
    groupName: {
      type: String,
      required: true,
    },
    option: {
      type: Object,
      required: true,
    }
  },
  setup(props, { emit }) {
    const checked = ref(props.option.checked);
    const onChange = () => {
      if(checked.value) emit('update:checked', props.option);
    };

    return {
      checked,
      onChange,
    }
  }
}
</script>