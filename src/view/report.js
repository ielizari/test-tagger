  const table = new Tabulator("#data-table", {
    //height: "500px",
    data: reportData,
    dataTree: true,
    dataTreeStartExpanded: true,
    dataTreeChildField: 'nested',
    history: true,
    columns:[
    {title:"Description", field:"test", width:650},
    {title:"File", field:"file", hozAlign:"center", sorter:"date", width:150},
    {title:"Type", field:"name", width:50, responsive:0},
    {title:"Modifiers", field:"modifiers", width:150},
    {title:"Tags", field:"codeTags", width:350},
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

