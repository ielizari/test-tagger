
export const DISPLAY_TYPES = Object.freeze({
  TREE: {label: 'Tree', value:'tree'},
  FLAT: { label: 'Flat', value: 'flat'}
});

export const GROUP_BY_TYPES = Object.freeze({
  FILE: {label: 'File', value:'file'},
  FUNCTIONALITY: {label: 'Functionality', value:'functionality'},
});

export const SKIPPED_TYPES = Object.freeze({
  ALL: { label: 'All', value:'all'},
  SKIPPED: { label: 'Skipped only', value: 'skipped'},
  NOT_SKIPPED: { label: 'Not skipped', value: 'not-skipped'},
});

export const mapGroupByCoverage = (coverage) => {
  if (!coverage.id) {
    console.error('Field \'id\' is required in coverage items', coverage);
    return;
  }
  return {
    label: coverage.name ?? coverage.id,
    value: coverage.id,
  }
}
