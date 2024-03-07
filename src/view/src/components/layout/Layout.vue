<template>
  <div class="main-container">
    <HeaderComponent />
    <main>
      <slot></slot>
    </main>
    <FooterComponent />
  </div>
</template>

<script>
import HeaderComponent from './HeaderComponent.vue';
import FooterComponent from './FooterComponent.vue';
export default {
  name: 'Layout',
  components: {
    HeaderComponent,
    FooterComponent,
  }
}
</script>