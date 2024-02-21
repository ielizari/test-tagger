<template>
  <RadioButton
    v-for="option in options"
    :groupName="groupName"
    :option="option"
    @update:checked="onOptionChecked"
  />
</template>

<script>
import RadioButton from './RadioButton.vue';

export default {
  name: 'RadioGroup',
  components: {
    RadioButton,
  },
  emits: ['optionChecked'],
  props: {
    groupName: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    }
  },
  setup(props, { emit }) {
    const onOptionChecked = (selectedOption) => {
      console.log(selectedOption)
      emit('optionChecked', selectedOption);
    }

    return {
      onOptionChecked,
    }
  }
}
</script>