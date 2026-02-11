// url dummyjson
const URL_PRODUCTOS = 'https://dummyjson.com/products?limit=194';

// variable para guardar todos los productos
let todosLosProductos = [];

// Función para cargar los productos de dummyjson
const cargarProductos = () => {
    const conteneP = document.getElementById("contenedor-productos");
    conteneP.innerHTML = '<div class="loading">Cargando productos...</div>';

    fetch(URL_PRODUCTOS)
    .then(res => res.json())
    .then(data => {
        console.log("Datos recibidos de dummyjson:", data);
        // guardamos los productos en la variable
        todosLosProductos = data.products;
        mostrarproduc(todosLosProductos);
    })
    .catch(error => {
        console.error("Error al cargar los productos de dummyjson:", error);
        conteneP.innerHTML = '<p style="text-align: center; color: #ff4444; font-size: 1.2rem;">Hubo un error al cargar los productos.</p>';
    });
};

// Función para mostrar las tarjetas de producto en el contenedor
const mostrarproduc = (prod) => {
    const conteneP = document.getElementById("contenedor-productos");
    conteneP.innerHTML = "";

    prod.forEach(producto => {
        // crear la tarjeta
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("card");

        // poner el contenido de la tarjeta con datos de dummyjson
        tarjeta.innerHTML = `
            <img src="${producto.thumbnail}" alt="${producto.title}" class="card-img">
            <div class="card-info">
                <span class="card-category">${producto.category}</span>
                <h3 class="card-title">${producto.title}</h3>
                <p class="card-rating">⭐ ${producto.rating}</p>
                <p class="card-price">$${producto.price}</p>
            </div>
        `;

        // cuando le das click a la tarjeta se abre el detalle del producto
        tarjeta.addEventListener("click", () => {
            mostrarDetalle(producto);
        });

        // agregar la tarjeta al contenedor
        conteneP.appendChild(tarjeta);
    });
};

// Función para mostrar el detalle cuando le das click a una tarjeta
const mostrarDetalle = (producto) => {
    // reemplazamos todo el body con el detalle del producto
    document.body.innerHTML = `
        <div class="detalle-contenedor">
            <button class="btn-regreso" onclick="regresarCatalogo()">← Regresar al catálogo</button>
            <div class="detalle-producto">
                <img src="${producto.thumbnail}" alt="${producto.title}" class="detalle-img">
                <div class="detalle-info">
                    <span class="detalle-category">${producto.category}</span>
                    <h1 class="detalle-title">${producto.title}</h1>
                    <p class="detalle-brand">Marca: ${producto.brand}</p>
                    <p class="detalle-description">${producto.description}</p>
                    <p class="detalle-price">Precio: $${producto.price}</p>
                    <div class="detalle-opiniones">
                        <h3>Opiniones</h3>
                        ${producto.reviews.map(review => `
                            <div class="opinion">
                                <p class="opinion-nombre">${review.reviewerName}</p>
                                <p class="opinion-estrellas">⭐ ${review.rating}/5</p>
                                <p class="opinion-comentario">${review.comment}</p>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Función para regresar al catálogo cuando le das click en "Regresar"
const regresarCatalogo = () => {
    // reconstruir la página original
    document.body.innerHTML = `
        <header>
            <h1>Practica Dummy JSON</h1>
        </header>
        <nav class="navbar navbar-light bg-light">
            <div class="container-fluid">
                <div class="d-flex" role="search">
                    <input class="form-control me-2" type="search" id="buscador" placeholder="Buscar productos...">
                    <button class="btn btn-outline-success" type="button" id="btn-buscar">Buscar</button>
                </div>
            </div>
        </nav>
        <main id="contenedor-productos" class="contenedor-productos"></main>
    `;
    // volver a conectar la búsqueda porque se reconstruyo el HTML
    conectarBusqueda();
    // mostrar los productos que ya tenemos guardados sin hacer otra petición
    mostrarproduc(todosLosProductos);
};

// Función para buscar productos según lo que escribiste en el input
const buscarProductos = () => {
    const input = document.getElementById("buscador");
    const palabra = input.value.toLowerCase();
    const conteneP = document.getElementById("contenedor-productos");

    // si el input esta vacio mostrar todos los productos
    if (palabra === "") {
        mostrarproduc(todosLosProductos);
        return;
    }

    // filtrar los productos por nombre, categoria o marca
    const resultados = todosLosProductos.filter(producto =>
        producto.title.toLowerCase().includes(palabra) ||
        producto.category.toLowerCase().includes(palabra) ||
        producto.brand?.toLowerCase().includes(palabra)
    );

    // si no encontro nada mostrar mensaje
    if (resultados.length === 0) {
        conteneP.innerHTML = '<p style="text-align:center; color:#ff4444; font-size:1.2rem;">No se encontraron productos.</p>';
        return;
    }

    // mostrar solo los productos que coinciden
    mostrarproduc(resultados);
};

// Función para conectar los eventos del botón y del input de búsqueda
const conectarBusqueda = () => {
    const btnBuscar = document.getElementById("btn-buscar");
    const input = document.getElementById("buscador");

    // cuando le das click al botón buscar
    btnBuscar.addEventListener("click", buscarProductos);

    // también busca cuando presionas Enter
    input.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            buscarProductos();
        }
    });
};

// cuando la página termina de cargarse esto se ejecuta primero
document.addEventListener("DOMContentLoaded", () => {
    conectarBusqueda();
    cargarProductos();
});