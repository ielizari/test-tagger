<template>
  <header>
    <h1>Test report</h1>
    <div class="summary__container">
      <div>Created</div>
      <div>###timestamp###</div>
      <div>File count</div>
      <div id="summary-files"></div>
      <div>Test count</div>
      <div id="summary-test-count"></div>
      <div>Skipped tests</div>
      <div id="summary-skipped"></div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderComponent',
}
</script>