//datos simula nuve de servicios cloud
const baseDeDatosCloud = [
    { nombre: "Amazon EC2", tipo: "IaaS", estado: "Activo", costo: 35.00 },
    { nombre: "Google Drive Enterprise", tipo: "SaaS", estado: "Activo", costo: 12.50 },
    { nombre: "Heroku App Server", tipo: "PaaS", estado: "Inactivo", costo: 0.00 },
    { nombre: "Azure Virtual Machines", tipo: "IaaS", estado: "Activo", costo: 40.00 }
]
//funcion flecha para cargar servicios
const cargarServicios =()=>{
    // rescatamos el div id para trabjar en el 
    const contenedorservicios = document.getElementById("contenedor-servicios");
    //linpiamos el contenedor
    contenedorservicios.innerHTML = " ";

    //recorremos la base de datos
    baseDeDatosCloud.forEach(servicio => {
        //
        if(servicio.estado == "Activo"){
            contenedorservicios.innerHTML += "<div class='card'><p class='activo' >"+servicio.nombre+"</p></div>"
        }
         else
        {
            contenedorservicios.innerHTML += "<div class='card'><p class='inactivo' >"+servicio.nombre+"</p></div>"
        }
    });
}