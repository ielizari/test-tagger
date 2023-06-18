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


  // table.on("tableBuilt", () => {
  //   table.setPage(2);
  // });
//};

