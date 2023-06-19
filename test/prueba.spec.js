import React from 'react';
import { screen } from '@testing-library/react';
import selectEvent from 'react-select-event'
import App from '../front/App';
import { renderWithProviders } from './test-utils'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils';
import {ISOStringToFormatedDate} from '../lib/date.utils'

afterEach(() => {
  jest.resetAllMocks();
});

describe.skip('Mock test suite',()=>{
describe("Lista de tareas", () =>{
  afterEach(()=>{
    jest.resetAllMocks();
  });
  it("Muestra lista de tareas", async()=>{
    renderWithProviders(<App />, {route: '/tasks'})
    expect(await screen.findByLabelText(/Nueva tarea/i)).toBeInTheDocument()
    expect(await screen.findByLabelText(/Filtrar/i)).toBeInTheDocument()
    expect(await screen.findByPlaceholderText(/Buscar.../i)).toBeInTheDocument()

    expect(await screen.findByText(/Hacer la compra/i)).toBeInTheDocument()
    expect(await screen.findByText(/KYB - ID 167: PET/i)).toBeInTheDocument()
  }) 

  it("Muestra el botón de 'Nueva tarea' que redirige al formulario de crear nueva tarea", async()=>{
    renderWithProviders(<App />, {route: '/tasks'})
    expect(await screen.findByLabelText(/Nueva tarea/i)).toHaveAttribute('href','/tasks/new')
  })
  
  it("Introduce el texto 'Hacer la compra' en el buscador y filtra la lista de tareas para que solo aparezca esa tarea", async()=>{
    renderWithProviders(<App />, {route: '/tasks'})
    await act(async () => {
      userEvent.type(await screen.findByPlaceholderText(/Buscar.../i),"Hacer la compra")
    })    
    
    await act(async() => {
      userEvent.click(await screen.queryByLabelText(/Filtrar/i))
    })
    
    expect(await screen.findByText(/Hacer la compra/i)).toBeInTheDocument()
    expect(await screen.queryByText(/KYB - ID 167: PET/i)).not.toBeInTheDocument()    
  })

  it("Cuando se elimina el contenido del buscador y se vuelve a pulsar el botón 'Filtrar', se muestra la lista de tareas sin filtrar", async()=>{
    await renderWithProviders(<App />, {route: '/tasks'})

    await act(async () => {
      userEvent.type(await screen.findByPlaceholderText(/Buscar.../i),"Hacer la compra")
    })    
    
    await act(async() => {
      userEvent.click(await screen.queryByLabelText(/Filtrar/i))
    })
    
    expect(await screen.findByText(/Hacer la compra/i)).toBeInTheDocument()
    expect(await screen.queryByText(/KYB - ID 167: PET/i)).not.toBeInTheDocument()    

    await act(async () => {
      userEvent.clear(await screen.findByPlaceholderText(/Buscar.../i))
    })    
    
    await act(async() => {
      userEvent.click(await screen.queryByLabelText(/Filtrar/i))
    })

    expect(await screen.findByText(/Hacer la compra/i)).toBeInTheDocument()
    expect(await screen.findByText(/KYB - ID 167: PET/i)).toBeInTheDocument()    
  })

  it("Cuando no existen tareas o no existen resultados para los filtros introducidos, la lista de tareas muestra mensaje indicándolo", async() => {
    renderWithProviders(<App />, {route: '/tasks'})
    await act(async () => {
      userEvent.type(await screen.findByPlaceholderText(/Buscar.../i),"Tarea que no existe")
    })    
    
    await act(async() => {
      userEvent.click(await screen.queryByLabelText(/Filtrar/i))
    })
    
    expect(await screen.findByText(/No se han encontrado resultados/i)).toBeInTheDocument()
  })
})

describe("Detalle de tarea", () => {
  afterEach(()=>{
    jest.resetAllMocks();
  });
  it("Muestra todos los campos de una tarea", async() => {
    renderWithProviders(<App />, {route: '/tasks/1'})
    expect(await screen.findByText(/Hacer la compra/i)).toBeInTheDocument();
    expect(await screen.findByText(/Comprar huevos, leche, cebollas/i)).toBeInTheDocument();
    expect(await screen.findByText(/Iñaki/i)).toBeInTheDocument();
    expect(await screen.findByText(/Pendiente/i)).toBeInTheDocument();
    expect(await screen.findByText(/Alta/i)).toBeInTheDocument();

    expect(await screen.queryByText(/Esta acción es irreversible. ¿Desea continuar?/i)).not.toBeInTheDocument()
  })

  it("Muestra mensaje 'La tarea no existe' si se busca un id que no existe", async() => {
    renderWithProviders(<App />, {route: 'tasks/1111'})
    expect(await screen.findByText(/La tarea no existe/i)).toBeInTheDocument();
  })

  it("Muestra los botones de editar, borrar y crear subtarea al ver el detalle de una tarea", async () => {
    renderWithProviders(<App />, {route: '/tasks/1'})
    expect(await screen.findByLabelText(/Editar/i)).toBeInTheDocument()
    expect(await screen.findByLabelText(/Borrar/i)).toBeInTheDocument()
    expect(await screen.findByLabelText(/Subtarea/i)).toBeInTheDocument()
  })

  it("El botón 'Editar' carga la url tasks/edit/1", async() => {
    renderWithProviders(<App />, {route: 'tasks/1'})
    expect(await screen.findByLabelText(/Editar/i)).toHaveAttribute('href','/tasks/edit/1')
  })

  it("El botón 'Subtarea' carga la url tasks/new/1", async() => {
    renderWithProviders(<App />, {route: 'tasks/1'})
    expect(await screen.findByLabelText(/Subtarea/i)).toHaveAttribute('href','/tasks/new/1')
  })

  it("El botón 'Borrar' muestra diálogo de confirmación", async() => {   
    await renderWithProviders(<App />, {route: 'tasks/1'})  
    userEvent.click(await screen.findByLabelText(/Borrar/i))
    expect(await screen.queryByText(/Esta acción es irreversible. ¿Desea continuar?/i)).toBeInTheDocument()
    expect(await screen.queryByLabelText(/Aceptar/i)).toBeInTheDocument()
    expect(await screen.queryByLabelText(/Cancelar/i)).toBeInTheDocument()
  })

  it("Al pulsar 'Aceptar' en el diálogo de confirmación de la acción 'Borrar', se borra la tarea", async() => {   
    await renderWithProviders(<App />, {route: 'tasks/1'})  
    await act(async () => {
      userEvent.click(await screen.findByLabelText(/Borrar/i))
    })    
    
    await act(async() => {
      userEvent.click(await screen.queryByLabelText(/Aceptar/i))
    })
    
    expect(await screen.findByLabelText("success-message")).toHaveTextContent(/La tarea se ha eliminado con éxito/i)

  })
})

describe("Nueva tarea", () => {
 
  it("Muestra los campos de la nueva tarea con los valores por defecto", async() =>{            
      renderWithProviders(<App />, {route: '/tasks/new'})      

      expect(await screen.findByLabelText('title')).toHaveValue("")
      expect(await screen.findByLabelText('description')).toHaveValue("")
      expect(await screen.findByLabelText('author')).toHaveValue("")
      expect(await screen.findByLabelText('limitDate')).toHaveValue("")
      
      expect(await screen.getByRole("form")).toHaveFormValues({ status: "1" })
      expect(await screen.getByTestId("status")).toHaveTextContent("Pendiente")
      expect(await screen.getByRole("form")).toHaveFormValues({ priority: "1" })
      expect(await screen.getByTestId("priority")).toHaveTextContent("Baja")
  }) 

  it("Al enviar el formulario de nueva tarea vacío se muestra error en los campos obligatorios", async() => {
     
      renderWithProviders(<App />, {route: '/tasks/new'})
     
      await act( async() => {
        userEvent.click(await screen.getByText(/Guardar/i))
      })

      expect(await screen.findByLabelText('validate_title')).toHaveTextContent(/Campo obligatorio/i)
      expect(await screen.findByLabelText('validate_author')).toHaveTextContent(/Campo obligatorio/i)
  })

  it("Se introduce una fecha válida y el formulario la valida correctamente", async() => {
    renderWithProviders(<App />, {route: '/tasks/new'})

    await act( async() => {
      userEvent.type(await screen.getByLabelText(/Fecha Límite/i),"28/12/2020 12:00")
    })
    await act( async() => {
      userEvent.click(screen.getByText(/Guardar/i))
    })

    expect(await screen.queryByLabelText('validate_limitDate')).not.toBeInTheDocument()
})

  it("Guarda una tarea nueva correctamente", async() => {
       
      renderWithProviders(<App />, {route: '/tasks/new'})

      await act(async () => {
        userEvent.type(await screen.findByLabelText('title'),'Add tarea test')
        userEvent.type(await screen.findByLabelText('description'),'success')
        userEvent.type(await screen.findByLabelText('author'),'DummyUser')
        userEvent.click(screen.getByText(/Guardar/i))
      })

      expect(await screen.findByLabelText('success-message')).toHaveTextContent(/La tarea 'Add tarea test' ha sido creada con éxito/i)
  })

  it("Muestra un mensaje de error si no se ha podido añadir la tarea, manetniendo los datos introducidos", async() => {
       
    renderWithProviders(<App />, {route: '/tasks/new'})

    await act(async () => {
      userEvent.type(await screen.findByLabelText('title'),'Add tarea test')
      userEvent.type(await screen.findByLabelText('description'),'error')
      userEvent.type(await screen.findByLabelText('author'),'DummyUser')
      userEvent.click(screen.getByText(/Guardar/i))
    })

    expect(await screen.findByLabelText('error-message')).toHaveTextContent(/Error al crear la tarea/i)

    expect(await screen.findByLabelText('title')).toHaveValue("Add tarea test")
    expect(await screen.findByLabelText('description')).toHaveValue("error")
    expect(await screen.findByLabelText('author')).toHaveValue("DummyUser")
    expect(await screen.queryByLabelText('loading')).not.toBeInTheDocument()
  })
  
})

describe("Editar tarea", () => {
    it("Muestra el formulario de edición de tareas y carga los datos de la tarea seleccionada", async () => {
      renderWithProviders(<App />, {route: '/tasks/edit/1'})    

      expect(await screen.findByLabelText('title')).toHaveValue("Hacer la compra")
      expect(await screen.findByLabelText('description')).toHaveValue("Comprar huevos, leche, cebollas")
      expect(await screen.findByLabelText('author')).toHaveValue("Iñaki")
      expect(await screen.findByLabelText('limitDate')).toHaveValue(ISOStringToFormatedDate("2020-12-01T10:45:00.000Z")) //"01/12/2020 09:45"
      expect(await screen.getByRole("form")).toHaveFormValues({ status: "1" })
      expect(await screen.getByTestId("status")).toHaveTextContent("Pendiente")
      expect(await screen.getByRole("form")).toHaveFormValues({ priority: "3" })
      expect(await screen.getByTestId("priority")).toHaveTextContent("Alta")
    })

    it("Muestra mensaje de éxito al pulsar el botón 'Guardar' actualizar los datos de la tarea", async () => {
      renderWithProviders(<App />, {route: '/tasks/edit/1'})

      await act(async () => {
        userEvent.click(await screen.findByLabelText('Guardar'))
      })

      expect(await screen.findByLabelText('success-message')).toHaveTextContent(/La tarea 'Hacer la compra' ha sido editada con éxito/i)
      expect(await screen.queryByLabelText('loading')).not.toBeInTheDocument()
    })
})

describe("Lista de partes de trabajo", () =>{
  afterEach(()=>{
    //jest.resetModules()
    //jest.clearAllMocks()
    jest.resetAllMocks()
  });
  
  it("Muestra lista de partes de trabajo", async()=>{
    renderWithProviders(<App />, {route: '/worklogs'})

    expect(await screen.findByLabelText(/Nuevo parte/i)).toBeInTheDocument()
    expect(await screen.findByLabelText(/Nuevo parte/i)).toHaveAttribute('href','/worklogs/new')
    expect(await screen.findByLabelText(/Filtrar/i)).toBeInTheDocument()
    expect(await screen.findByPlaceholderText(/Buscar.../i)).toBeInTheDocument()

    expect(await screen.findByText(/Compra 05-11-20/i)).toBeInTheDocument();
    expect(await screen.findByText(/Compra 15-11-20/i)).toBeInTheDocument();    
  }) 

  it("Cuando se elimina el contenido del buscador y se vuelve a pulsar el botón 'Filtrar', se muestra la lista de partes sin filtrar", async()=>{
    renderWithProviders(<App />, {route: '/worklogs'})
    await act(async () => {
      userEvent.type(await screen.findByPlaceholderText(/Buscar.../i),"Compra 15-11-20")
    })    
    console.log(".")
    await act(async() => {
      userEvent.click(await screen.findByLabelText(/Filtrar/i))
    })
    
    
    expect(await screen.findByText(/Compra 15-11-20/i)).toBeInTheDocument()
    expect(await screen.queryByText(/Compra 05-11-20/i)).not.toBeInTheDocument()

    await act(async () => {
      userEvent.clear(await screen.findByPlaceholderText(/Buscar.../i))
    })    
    
    await act(async() => {
      userEvent.click(await screen.queryByLabelText(/Filtrar/i))
    })

    expect(await screen.findByText(/Compra 15-11-20/i)).toBeInTheDocument()
    expect(await screen.findByText(/Compra 05-11-20/i)).toBeInTheDocument()
  })

  it("Cuando no existen partes o no existen resultados para los filtros introducidos, la lista de partes muestra mensaje indicándolo", async() => {
    renderWithProviders(<App />, {route: '/worklogs'})
    await act(async () => {
      userEvent.type(await screen.findByPlaceholderText(/Buscar.../i),"Parte que no existe")
    })    
    
    await act(async() => {
      userEvent.click(await screen.queryByLabelText(/Filtrar/i))
    })
    
    expect(await screen.findByText(/No se han encontrado resultados/i)).toBeInTheDocument()
  })
})

describe("Nuevo parte", () => {
 
  it("Muestra los campos del nuevo parte con los valores por defecto", async() =>{            
      renderWithProviders(<App />, {route: '/worklogs/new'})

      expect(await screen.findByLabelText('title')).toHaveValue("")
      expect(await screen.findByLabelText('startDatetime')).toHaveValue("")
  }) 

  it("Al enviar el formulario de nuevo parte vacío se muestra error en los campos obligatorios", async() => {
     
      renderWithProviders(<App />, {route: '/worklogs/new'})
     
      await act( async() => {
        userEvent.click(await screen.getByText(/Guardar/i))
      })

      expect(await screen.findByLabelText('validate_title')).toHaveTextContent(/Campo obligatorio/i)
      expect(await screen.findByLabelText('validate_startDatetime')).toHaveTextContent(/Campo obligatorio/i)
  })

  it("Se introduce una fecha válida y el formulario la valida correctamente", async() => {
    renderWithProviders(<App />, {route: '/worklogs/new'})

    await act( async() => {
      userEvent.type(await screen.getByLabelText(/startDatetime/i),"28/12/2020 08:35")
    })
    await act( async() => {
      userEvent.click(screen.getByText(/Guardar/i))
    })

    expect(await screen.queryByLabelText('validate_startDatetime')).not.toBeInTheDocument()
  })

  it("Se introduce una fecha y hora no válida y el formulario muestra el mensaje de fecha y hora no válido ", async() => {
    renderWithProviders(<App />, {route: '/worklogs/new'})

    await act( async() => {
      userEvent.type(await screen.getByLabelText(/startDatetime/i),"28/12/2020 08:35asf")
    })
    await act( async() => {
      userEvent.click(screen.getByText(/Guardar/i))
    })

    expect(await screen.queryByLabelText('validate_startDatetime')).toHaveTextContent(/Formato de fecha y hora no válido/i)
  })

  it("Se introduce una fecha sin hora y el formulario muestra el mensaje de fecha y hora no válido ", async() => {
    renderWithProviders(<App />, {route: '/worklogs/new'})

    await act( async() => {
      userEvent.type(await screen.getByLabelText(/startDatetime/i),"28/12/2020")
    })
    await act( async() => {
      userEvent.click(screen.getByText(/Guardar/i))
    })

    expect(await screen.queryByLabelText('validate_startDatetime')).toHaveTextContent(/Formato de fecha y hora no válido/i)
  })


  it("Guarda un parte nuevo correctamente", async() => {       
      renderWithProviders(<App />, {route: '/worklogs/new'})

      await act(async () => {
        userEvent.type(await screen.findByLabelText('title'),'Parte success')
        userEvent.type(await screen.findByLabelText('startDatetime'),'01/01/2020 08:00')
        userEvent.click(screen.getByText(/Guardar/i))
      })

      expect(await screen.findByLabelText('success-message')).toHaveTextContent(/El parte 'Parte success' ha sido creado con éxito/i)
  })

  it("Muestra un mensaje de error si no se ha podido añadir el parte, manetniendo los datos introducidos", async() => {
       
    renderWithProviders(<App />, {route: '/worklogs/new'})

    await act(async () => {
      userEvent.type(await screen.findByLabelText('title'),'Parte error')
      userEvent.type(await screen.findByLabelText('startDatetime'),'01/01/2020 08:00')
      userEvent.click(screen.getByText(/Guardar/i))
    })

    expect(await screen.findByLabelText('error-message')).toHaveTextContent(/Error al crear el parte/i)

    expect(await screen.findByLabelText('title')).toHaveValue("Parte error")
    expect(await screen.findByLabelText('startDatetime')).toHaveValue("01/01/2020 08:00")
    expect(await screen.queryByLabelText('loading')).not.toBeInTheDocument()
  })
  
})

describe("Detalle de parte", () => {
  afterEach(()=>{
    jest.resetAllMocks();
  });
  it("Muestra todos los campos de un parte", async() => {
    renderWithProviders(<App />, {route: '/worklogs/1'})

      expect(await screen.findByText(/Compra 05-11-20/i)).toBeInTheDocument();
      expect(await screen.findByText(/05\/11\/2020 08:00/i)).toBeInTheDocument();
      expect(await screen.findByText(/05\/11\/2020 09:00/i)).toBeInTheDocument();
      expect(await screen.findByText(/05\/11\/2020 16:30/i)).toBeInTheDocument();

      expect(await screen.queryByText(/Esta acción es irreversible. ¿Desea continuar?/i)).not.toBeInTheDocument()
    
  })  

  it("Muestra los botones de editar, borrar y añadir trabajo al ver el detalle de un parte", async () => {
    renderWithProviders(<App />, {route: '/worklogs/1'})

    expect(await screen.findByLabelText(/Editar/i)).toBeInTheDocument()
    expect(await screen.findByLabelText(/Borrar/i)).toBeInTheDocument()
    expect(await screen.findAllByLabelText(/Añadir trabajo/i)).toHaveLength(1)    
  })

  it("El botón 'Editar' carga la url worklogs/edit/1", async() => {
    renderWithProviders(<App />, {route: 'worklogs/1'})
    expect(await screen.findByLabelText(/Editar/i)).toHaveAttribute('href','/worklogs/edit/1')
  })  

  it("El botón 'Borrar' muestra diálogo de confirmación", async() => {   
    renderWithProviders(<App />, {route: 'worklogs/1'})  
    userEvent.click(await screen.findByLabelText(/Borrar/i))
    expect(await screen.queryByText(/Esta acción es irreversible. ¿Desea continuar?/i)).toBeInTheDocument()
    expect(await screen.queryByLabelText(/Aceptar/i)).toBeInTheDocument()
    expect(await screen.queryByLabelText(/Cancelar/i)).toBeInTheDocument()
  })

  it("Muestra mensaje 'El parte no existe' si se busca un id que no existe", async() => {
    renderWithProviders(<App />, {route: '/worklogs/1111'})
    expect(await screen.findByText(/El parte no existe/i)).toBeInTheDocument();
  })

  it("Al pulsar 'Aceptar' en el diálogo de confirmación de la acción 'Borrar', se borra el parte", async() => {   
    renderWithProviders(<App />, {route: 'worklogs/1'})  
    await act(async () => {
      userEvent.click(await screen.findByLabelText(/Borrar/i))
    })    
    
    await act(async() => {
      userEvent.click(await screen.queryByLabelText(/Aceptar/i))
    })
    
    expect(await screen.findByLabelText("success-message")).toHaveTextContent(/El parte se ha eliminado con éxito/i)

  })
})

describe("Editar parte de trabajo", () => {
  it("Muestra el formulario de edición de parte y carga los datos del parte seleccionado",  async () => {
    renderWithProviders(<App />, {route: '/worklogs/edit/1'})
    
    expect(await screen.findByDisplayValue(/Compra 05-11-20/i)).toBeInTheDocument()
    expect(await screen.findByDisplayValue('05/11/2020 09:00')).toBeInTheDocument()
    expect(await screen.findByLabelText('title')).toHaveValue('Compra 05-11-20')
    expect(await screen.findByLabelText('startDatetime')).toHaveValue('05/11/2020 09:00')
  })
  


  it("Muestra mensaje de éxito al pulsar el botón 'Guardar' y actualizar los datos del parte", async () => {
    renderWithProviders(<App />, {route: '/worklogs/edit/1'})

    expect(await screen.findByDisplayValue(/Compra 05-11-20/i)).toBeInTheDocument()
    expect(await screen.findByText(/Editar parte/i)).toBeInTheDocument()

    await act(async () => {
      userEvent.click(await screen.findByLabelText('Guardar'))
    })

    expect(await screen.findByLabelText('success-message')).toHaveTextContent(/El parte 'Compra 05-11-20' ha sido editado con éxito/i)
    expect(await screen.queryByLabelText('loading')).not.toBeInTheDocument()
  })
})
});