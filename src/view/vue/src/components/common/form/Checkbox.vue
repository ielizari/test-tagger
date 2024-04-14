<template>
  <div
    class="form-checkbox__container"
    :class="containerClass">
    <label
      v-if="label"
      :for="id">
      {{ label }}
    </label>
    <input
      :id="id"
      type="checkbox"
      v-model="checked" />
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';
export default {
  name: 'FormCheckbox',
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: false,
      default: null,
    },
    value: {
      type: [String, Number],
      required: false,
      default: null,
    },
    defaultChecked: {
      type: Boolean,
      required: false,
      default: false,
    },
    labelPosition: {
      type: String,
      required: false,
      default: 'left'
    },
  },
  emits: ['checkedState'],
  setup(props, { emit }) {
    const checked = ref(props.defaultChecked);
    watch(checked, (newValue) => {
      emit('checkedState', newValue);
    });

    const containerClass = computed(() => {
      return 'label--' + props.labelPosition;
    })

    return {
      checked,
      containerClass,
    }
  }

}
</script>

<style lang="less">
.form-checkbox__container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  width: 100%;

  label {
    width: 100%;
    padding: 0.3rem 0;
    cursor: pointer;
  }

  &.label--left {
    flex-direction: row;
  }
  &.label--right {
    flex-direction: row-reverse;
  }
  &.label--top {
    flex-direction: column;
  }
  &.label--bottom {
    flex-direction: column-reverse;
  }

}
</style>