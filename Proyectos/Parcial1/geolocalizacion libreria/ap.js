let latitud;
let longitud;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
        (posicion)=>{
            latitud= posicion.coords.latitude;
            longitud= posicion.coords.longitude;
            
            
            const ubicacion=[latitud,longitud]
            var map = L.map('map').setView(ubicacion, 13);
            
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
        
            let marker = L.marker(ubicacion).addTo(map);
            marker.bindPopup("<p>Papu aquí estoy</p>").openPopup();
        });

        (Error)=>{
            console.log("No se pudo obtener la localización"+Error.message);
        }

    }
    else{
        console.log("Tu navegador no soporta la geolocalización");
    }





























