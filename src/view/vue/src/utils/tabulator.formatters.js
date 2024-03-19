export const tagFieldFormatter = (cell, formatterParams, onRendered) => {
  return createTagNode(cell, true, formatterParams);
}

export const modifiersFieldFormatter = (cell, formatterParams, onRendered) => {
  return createTagNode(cell, false, formatterParams);
}

export const descriptionFormatter = (cell, formatterParams, onRendered) => {
  const { currentDisplayData } = formatterParams;
  const data = cell.getData();
  const value = cell.getValue();
  const description = currentDisplayData === 'tree' ? value : data.parentLabels.concat(value).join(' > ');
  return data.itemCount.items ? `${value} (${data.itemCount.items} items ${data.itemCount.tests} tests)` : description;
}

export const coverageTagFieldFormatter = (cell, formatterParams, onRendered) => {
  const data = cell.getData();
  return data.label ? '' : createTagNode(cell, true, formatterParams);
}

export const coverageModifiersFieldFormatter = (cell, formatterParams, onRendered) => {
  const data = cell.getData();
  return  data.label ? '' : createTagNode(cell, false, formatterParams);
}

export const coverageDescriptionFormatter = (cell, formatterParams, onRendered) => {
  const data = cell.getData();
  const value = cell.getValue();
  return data.label ? `${data.label}  (${data.itemCount.tests} tests / ${data.itemCount.skipped} skipped)` : data.parentLabels.concat(value).join(' > ');
}

export const coverageRowFormatter = (row) => {
  const data = row.getData();
  if (data.label) {
    let style = row.getElement().style
    style.backgroundColor = '#ffe396';
    style.fontWeight = 'bold';
  }
}

export const createTagNode = (cell, isTag = true, formatterParams) => {
  const data = cell.getData();
  const cellContainer = document.createElement('div');
  cellContainer.classList = 'tag-container';
  const nodes = cell.getValue().map((tag) => {
    if (tag.auto && formatterParams.filterAutotags && !formatterParams.filterAutotags.checked) {
      return;
    }
    const tagContainer = document.createElement('div');
    const text = isTag ? tag.name : tag === 'skip' && data.skipped === 'inherit_skip' ? 'inherited skip' : tag;
    const textNode = document.createTextNode(text);
    tagContainer.classList.add('tag');
    if (tag.auto) {
      tagContainer.classList.add('tag-auto');
    }
    tagContainer.appendChild(textNode);
    return tagContainer;
  }).filter((node) => node);
  nodes.forEach((node) => {
    cellContainer.appendChild(node);
  });
  return cellContainer;
}