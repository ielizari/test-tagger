window.onload = () => {
  const treeChildField = 'nested';
  const compare = {
    '=': function(a, b) { return a == b },
    '<': function(a, b) { return a < b },
    '<=': function(a, b) { return a <= b },
    '>': function(a, b) { return a > b },
    '>=': function(a, b) { return a >= b },
    '!=': function(a, b) { return a != b },
    'like': function(a, b) { return a.includes(b)}
  };

  const checkFilter = (data, filter) => {
    if (Array.isArray(filter)) {
      return filter
        .map((condition) => {
          if(Array.isArray(data[condition.field])) {
            return data[condition.field]
              .map((item) => compare[condition.type](item, condition.value))
              .reduce((result, current) => result || current, false)
          }
          return compare[condition.type](data[condition.field], condition.value);
        })
        .reduce((result, current) => result || current, false)
    }
    return compare[filter.type](data[filter.field], filter.value);
  }

  const filterTree = function (data, filter) {
    if(!filter || (!Array.isArray(filter) && !filter.value)) return true;
    if(checkFilter(data, filter)) return true;
    if (data[treeChildField] && data[treeChildField].length > 0) {
      for (const i in data[treeChildField]) {
        const childOK = filterTree(data[treeChildField][i], filter);
        if(childOK) return true;
      }
    }
    return false;
  };

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
  let fieldsFilterBtn;
  let fieldsFilterDropdown;
  let fieldsFilterApply;
  let filterInput;

  table.on("tableBuilt", () => {
    initControls();
    const columns = Object.values(table.getColumns()).map((col) => {
      const { title, field } = col._column.definition;
      return { title, field };
    });

    columns.forEach((column) => {
      const option = document.createElement('div');
      const checkbox = document.createElement('checkbox');
      const label = document.createAttribute('label');
      option.appendChild(checkbox, label);
      fieldsFilterDropdown.appendChild(option)
      //filterFields.options[filterFields.options.length] = new Option(column.title, column.field);
    });
  });

  function initControls () {
    filterForm = document.getElementById('filter-form');
    fieldsFilterDropdown = document.getElementById('filter-fields-dropdown');

    fieldsFilterBtn = document.getElementById('filter-fields-control');
    fieldsFilterBtn.addEventListener('click', () => {
      if (fieldsFilterDropdown.classList.contains('hidden')) {
        fieldsFilterDropdown.classList.remove('hidden');
      } else {
        fieldsFilterDropdown.classList.add('hidden');
      }
    });

    filterInput = document.getElementById('filter-input');

    fieldsFilterApply = document.getElementById('filter-apply');
    //fieldsFilterApply.addEventListener('click', () => {
    filterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const filterText = filterInput.value;
      table.clearFilter();
      if(!filterText) return;

      const filters = filterText
        .split(' ')
        .map((word) => {
          return ['test', 'file', 'modifiers', 'codeTags']
            .map((field) => { return {field:field, type:"like", value: word}})
        })
        .flat(Number.POSITIVE_INFINITY);
      table.setFilter(filterTree, filters)
    });
  }
}

