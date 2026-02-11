// URL de API
const urlApi = "https://equipo6.grupoahost.com/Api/listaProductos.php";

// Función para cargar los productos
const cargarProductos = () => {
    const contenedorProductos = document.getElementById("contenedor-productos");
    contenedorProductos.innerHTML = '<div class="loading">Cargando productos</div>';
    
    fetch(urlApi)
        .then(respuesta => respuesta.json())
        .then(data => {
            console.log("Datos recibidos:", data);
            mostrarProductos(data);
        })
        .catch(error => {
            console.error("Error al cargar los productos:", error);
            contenedorProductos.innerHTML = '<p style="text-align: center; color: #ff4444; font-size: 1.2rem;"> Hubo un error al cargar los productos. Por favor, intenta de nuevo.</p>';
        })
}

// Función para mostrar productos en el DOM
const mostrarProductos = (productos) => {
    const contenedorProductos = document.getElementById("contenedor-productos");
    contenedorProductos.innerHTML = "";


    productos.forEach(producto => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("practice-card");
        
        // Construir la URL completa de la imagen
        const imagenUrl = `https://equipo6.grupoahost.com/img/${producto.ImagenText}`;
        
        // Badge de stock bajo (si stock < 15)
        const stockBadge = producto.stock < 15 ? 
            `<span class="stock-badge"> Pocas unidades!!!!!!!</span>` : '';
        
        // Formatear precio
        const precioFormateado = parseFloat(producto.precio_venta).toFixed(2);
        
        tarjeta.innerHTML = `
            ${stockBadge}
            <div class="image-container">
                <img src="${imagenUrl}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/200x200/ff9933/ffffff?text=Sin+Imagen'">
            </div>
            <h3 class="practice-title">${producto.nombre}</h3>
            <p class="practice-description">${producto.descripcion}</p>
            
            <div class="price-section">
                <p class="price">$${precioFormateado}</p>
            </div>
            
            <span class="category-badge">${producto.categoria_nombre || 'Sin categoría'}</span>
            
            <p style="margin-top: 10px;"><strong>Stock:</strong> ${producto.stock} unidades</p>
            <p><strong>Código:</strong> ${producto.codigo}</p>
        `;
        
        contenedorProductos.appendChild(tarjeta);
    })
}
