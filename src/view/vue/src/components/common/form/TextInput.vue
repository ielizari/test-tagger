<template>
  <input
    type="text"
    v-model="text"
    :placeholder="placeholder"
    @change="onChange"
    @keyup="onChange"
    />
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'FormTextInput',
  props: {
    id: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      required: false,
      default: '',
    },
    defaultValue: {
      type: String,
      required: false,
      default: '',
    }
  },
  setup(props, { emit }) {
    const text = ref(props.defaultValue);
    const onChange = () => {
      emit('update:text', text.value);
    }

    return {
      text,
      onChange,
    }
  }
}
</script>