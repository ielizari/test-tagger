<template>
  <label v-if="label" :for="id">{{ label }}
    <select :id="id">
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
  setup() {

  }
}
</script>