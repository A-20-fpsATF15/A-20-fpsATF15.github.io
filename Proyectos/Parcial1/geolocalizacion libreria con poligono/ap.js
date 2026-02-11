

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
        (posicion)=>{
            
            
            const ubicacion=[
                [21.153124, -98.423928],
                [21.153063, -98.423831],
                [21.153151, -98.423741],
                [21.153228, -98.423842]
            ];
            var map = L.map('map');
            
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
            
            var polygon = L.polygon(ubicacion).addTo(map);
 
            map.fitBounds(polygon.getBounds());
           

            polygon.on('mouseover', ()=>{
                polygon.bindPopup("<p>Papu aquí estoy</p>").openPopup();
            });
            
            polygon.on('mouseout', ()=>{
                polygon.closePopup();
            });
        });

        (Error)=>{
            console.log("No se pudo obtener la localización"+Error.message);
        }

    }
    else{
        console.log("Tu navegador no soporta la geolocalización");
    }





























