  const table = new Tabulator("#data-table", {
    //height: "500px",
    data: reportData,
    dataTree: true,
    dataTreeStartExpanded: true,
    dataTreeChildField: 'nested',
    layout: "fitColumns",
    pagination: "local",
    paginationSize:25,
    history: true,
    groupBy: 'file',
    columns:[
    {title:"Description", field:"test", variableHeight: true},
    //{title:"File", field:"file", hozAlign:"center", sorter:"date", width:150},
    //{title:"Type", field:"name", responsive:0},
    {title:"Modifiers", field:"modifiers"},
    {title:"Tags", field:"codeTags", formatter: function(cell, formatterParams, onRendered) {
      const cellContainer = document.createElement('div');
      cellContainer.classList = 'tag-container';
      const nodes = cell.getValue().map((tag) => {
        const tagContainer = document.createElement('div');
        const text = document.createTextNode(tag);
        tagContainer.classList = 'tag';
        tagContainer.appendChild(text);
        return tagContainer;
      });
      nodes.forEach((node) => {
        cellContainer.appendChild(node);
      });
      return cellContainer;
    }},
    ],
  });


  let fieldsFilterBtn;
  let fieldsFilterDropdown;

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
    fieldsFilterDropdown = document.getElementById('filter-fields-dropdown');

    fieldsFilterBtn = document.getElementById('filter-fields-control');
    fieldsFilterBtn.addEventListener('click', () => {
      if (fieldsFilterDropdown.classList.contains('hidden')) {
        fieldsFilterDropdown.classList.remove('hidden');
      } else {
        fieldsFilterDropdown.classList.add('hidden');
      }
    });
  }

