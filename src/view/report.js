window.onload = () => {
  const treeChildField = 'nested';
  const fields = ['test', 'file', 'modifiers', 'codeTags', 'autoTags'];

  const isMatch = (data, words) => {
    const matches = words.map((word) => {
      for (const field of fieldsChecked) {
        if (data[field].includes(word)) {
          return true;
        }
      }
      return false;
    });

    return filterCombination === 'OR' ? matches.some((match) => match) : matches.every((match) => match);
  }

  const filterTree = function (data, words) {
    if(!words || (Array.isArray(words) && !words.length)) return true;

    if(isMatch(data, words)) return true;
    if (data[treeChildField] && data[treeChildField].length > 0) {
      for (let i=0; i< data[treeChildField].length; i++) {
        const childOK = filterTree(data[treeChildField][i], words);
        if(childOK) return true;
      }
    }
    return false;
  };


  const createFieldFilters = () => {
    const fieldsContainer = document.getElementById('filterFields');
    // const columns = Object.values(table.getColumns()).map((col) => {
    //   const { title, field } = col._column.definition;
    //   return { title, field };
    // });
    fieldsFilterElements = [];
    fields.forEach((fieldName) => {
      const container = document.createElement('label');
      const checkbox = document.createElement('input');
      const labelText = document.createTextNode(fieldName);
      checkbox.type = 'checkbox';
      checkbox.id = 'field_filter_' + fieldName;
      checkbox.value = fieldName;
      checkbox.name = 'fieldsFilter';
      checkbox.checked = true;
      fieldsFilterElements.push(checkbox);
      container.appendChild(checkbox);
      container.appendChild(labelText);
      fieldsContainer.appendChild(container);
    });
  }

  const createTagNode = (cell, isTag = true) => {
    const cellContainer = document.createElement('div');
    cellContainer.classList = 'tag-container';
    const nodes = cell.getValue().map((tag) => {
      const tagContainer = document.createElement('div');
      const text = document.createTextNode(isTag ? tag.name : tag);
      tagContainer.classList.add('tag');
      if (tag.auto) {
        tagContainer.classList.add('tag-auto');
      }
      tagContainer.appendChild(text);
      return tagContainer;
    });
    nodes.forEach((node) => {
      cellContainer.appendChild(node);
    });
    return cellContainer;
  }

  const tagFieldFormatter = (cell, formatterParams, onRendered) => {
    return createTagNode(cell, true);
  }

  const modifiersFieldFormatter = (cell, formatterParams, onRendered) => {
    return createTagNode(cell, false);
  }

  const descriptionMutator = (value, data, type, params, component) => {
    return data.itemCount.items ? `${value} (${data.itemCount.items} items ${data.itemCount.tests} tests)` : value;
  }

  const table = new Tabulator("#data-table", {
    //height: "500px",
    data: reportData,
    dataTree: true,
    dataTreeStartExpanded: true,
    dataTreeChildField: treeChildField,
    layout: "fitColumns",
    pagination: "local",
    paginationSize:25,
    history: true,
    groupBy: 'file',
    columns:[
    {title:"Description", field:"test", variableHeight: true, widthGrow:2, mutator: descriptionMutator},
    {title:"Modifiers", field:"modifiers", width:150, widthShrink:2, formatter: modifiersFieldFormatter},
    {title:"Tags", field:"tags", widthGrow:1, formatter: tagFieldFormatter},
    ],
  });


  let filterForm;
  let fieldsFilterApply;
  let fieldsContainer;
  let fieldsFilterElements;
  let fieldsChecked;
  let filterInput;
  let filterCombination;

  table.on("tableBuilt", () => {
    initControls();
  });

  function initControls () {
    filterForm = document.getElementById('filter-form');
    fieldsFilterDropdown = document.getElementById('filter-fields-dropdown');

    fieldsContainer = document.getElementById('filterFields');
    createFieldFilters();

    filterInput = document.getElementById('filter-input');

    fieldsFilterApply = document.getElementById('filter-apply');
    filterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const filterText = filterInput.value;
      table.clearFilter();
      if(!filterText) return;

      filterCombination = document.querySelector('input[name="filterCombination"]:checked').value;

      const filters = filterText.split(' ');
      fieldsChecked = [...fieldsContainer.querySelectorAll('input[name=fieldsFilter]:checked')]
        .map((node) => node.value);

      table.setFilter(filterTree, filters)
    });
  }
}

