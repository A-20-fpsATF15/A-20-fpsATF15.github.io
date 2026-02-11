const parrafo=document.getElementById("coordenadas");
const  enlace=document.getElementById("enlace");

const ubicacion=()=>{
    if (navigator.geolocation) {
        parrafo.innerHTML="Localizando...";
        
        navigator.geolocation.getCurrentPosition(
        (posicion)=>{
            const latitud= posicion.coords.latitude;
            const longitud= posicion.coords.longitude;
            
            parrafo.innerText="tus cordenadas son :   latitud:"+ latitud+" longitud: "+longitud;

            enlace.href="https://www.google.com/maps?q="+latitud+","+longitud;
            enlace.style.display="block";
        },
        ()=>{
            parrafo.innerText="No se pudo obtener la localización"+error.message;
            ;
            ;
        });
    }
    else{
        parrafo.innerText="Tu navegador no soporta la geolocalización"; P
    }

}
