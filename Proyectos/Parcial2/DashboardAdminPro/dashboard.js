const URL_BASE = 'https://dummyjson.com/products';
let skip = 0;
const limit = 10;
let totalProductos = 0;
let filtros = {
    busqueda: '',
    categoria: '',
    ordenar: null
};

// --- 1. CARGA INICIAL Y CATEGORÍAS ---
const cargarCategorias = () => {
    fetch(`${URL_BASE}/category-list`)
        .then(res => res.json())
        .then(categorias => {
            const select = document.getElementById('category-filter');
            categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
                select.appendChild(option);
            });
        });
};

// --- 2. FUNCIÓN NÚCLEO: CARGAR PRODUCTOS ---
const cargarProductos = () => {
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('no-results');
    const tbody = document.getElementById('products-tbody');
    
    loading.style.display = 'block';
    noResults.style.display = 'none';
    tbody.innerHTML = '';

    // Determinamos el endpoint base según el filtro activo
    let path = '';
    if (filtros.busqueda) {
        path = `/search?q=${filtros.busqueda}&`;
    } else if (filtros.categoria) {
        path = `/category/${filtros.categoria}?`;
    } else {
        path = '?';
    }

    // Construimos los parámetros de paginación y ordenamiento
    const params = new URLSearchParams({
        limit: limit,
        skip: skip
    });

    if (filtros.ordenar) {
        params.append('sortBy', filtros.ordenar.campo);
        params.append('order', filtros.ordenar.tipo);
    }

    const urlFinal = `${URL_BASE}${path}${params.toString()}`;

    fetch(urlFinal)
        .then(res => res.json())
        .then(data => {
            loading.style.display = 'none';
            totalProductos = data.total;
            
            if (data.products.length === 0) {
                noResults.style.display = 'block';
            } else {
                renderizarTabla(data.products);
            }
            actualizarPaginacion();
        })
        .catch(error => {
            console.error('Error:', error);
            loading.style.display = 'none';
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red; padding:20px;">Error al conectar con el servidor</td></tr>';
        });
};

// --- 3. RENDERIZADO DE TABLA ---
const renderizarTabla = (productos) => {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = productos.map(p => `
        <tr id="row-${p.id}">
            <td>${p.id}</td>
            <td><img src="${p.thumbnail}" alt="${p.title}" class="product-img"></td>
            <td>${p.title}</td>
            <td><span class="category-badge">${p.category}</span></td>
            <td class="price">$${p.price}</td>
            <td class="stock ${p.stock < 10 ? 'low' : ''}">${p.stock}</td>
            <td class="rating">⭐ ${p.rating}</td>
            <td class="actions">
                <button class="btn-action btn-edit" onclick="abrirModalEditar(${p.id})">✏️</button>
                <button class="btn-action btn-delete" onclick="eliminarProducto(${p.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
};

// --- 4. GESTIÓN DE INVENTARIO (C.U.D.) ---
const eliminarProducto = (id) => {
    if (!confirm('¿Eliminar producto del inventario?')) return;

    fetch(`${URL_BASE}/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.isDeleted) {
                alert('🗑️ Producto eliminado visualmente');
                document.getElementById(`row-${id}`).remove();
            }
        });
};

const guardarEdicion = () => {
    // Configuración para el formulario de edición
    const config = [
        { id: 'edit-title', requerido: true, minLen: 3 },
        { id: 'edit-price', requerido: true, tipo: 'number' },
        { id: 'edit-stock', requerido: true, tipo: 'number' },
        { id: 'edit-description', requerido: true, minLen: 5 }
    ];

    // LLAMADA: Detenemos si hay errores
    if (!validarFormulario(config)) return;

    const id = document.getElementById('edit-id').value;
    const body = {
        title: document.getElementById('edit-title').value,
        price: parseFloat(document.getElementById('edit-price').value),
        stock: parseInt(document.getElementById('edit-stock').value),
        description: document.getElementById('edit-description').value
    };

    fetch(`${URL_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(() => {
        alert('✅ Producto actualizado correctamente');
        cerrarModal('edit-modal');
        cargarProductos(); // Recargamos para ver los cambios simulados
    });
};

const crearProducto = () => {
    // Definimos la configuración para el formulario de creación
    const config = [
        { id: 'new-title', requerido: true, minLen: 3 },
        { id: 'new-price', requerido: true, tipo: 'number' },
        { id: 'new-category', requerido: true },
        { id: 'new-stock', requerido: true, tipo: 'number' },
        { id: 'new-description', requerido: true, minLen: 5 }
    ];

    // LLAMADA: Si no es válido, salimos de la función
    if (!validarFormulario(config)) return;
    const body = {
        title: document.getElementById('new-title').value,
        price: parseFloat(document.getElementById('new-price').value),
        category: document.getElementById('new-category').value,
        stock: parseInt(document.getElementById('new-stock').value),
        description: document.getElementById('new-description').value
    };

    fetch(`${URL_BASE}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
        alert(`✨ Nuevo producto creado con ID: ${data.id}`);
        cerrarModal('new-modal');
        cargarProductos();
    });
};
//validar campos del formulario de creación
// Función universal para validar cualquier formulario
const validarFormulario = (config) => {
    let esValido = true;

    // Limpiar errores previos
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));

    config.forEach(campo => {
        const input = document.getElementById(campo.id);
        const valor = input.value.trim();
        let mensajeError = "";

        // Regla: Obligatorio
        if (campo.requerido && !valor) {
            mensajeError = "Este campo es obligatorio";
        } 
        // Regla: No números negativos
        else if (campo.tipo === 'number' && parseFloat(valor) < 0) {
            mensajeError = "No se permiten valores negativos";
        }
        // Regla: Mínimo de caracteres
        else if (campo.minLen && valor.length < campo.minLen) {
            mensajeError = `Debe tener al menos ${campo.minLen} caracteres`;
        }

        if (mensajeError) {
            esValido = false;
            input.classList.add('error');
            // Insertar mensaje debajo del input
            const errorSpan = document.createElement('span');
            errorSpan.className = 'error-message';
            errorSpan.innerText = mensajeError;
            input.insertAdjacentElement('afterend', errorSpan);
        }
    });

    return esValido;
};

// --- 5. PAGINACIÓN Y FILTROS ---
const actualizarPaginacion = () => {
    const paginaActual = Math.floor(skip / limit) + 1;
    const totalPaginas = Math.ceil(totalProductos / limit) || 1;
    document.getElementById('page-info').textContent = `Página ${paginaActual} de ${totalPaginas}`;
    document.getElementById('prev-btn').disabled = skip === 0;
    document.getElementById('next-btn').disabled = skip + limit >= totalProductos;
};

// --- 6. EVENTOS ---
document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
    cargarProductos();

    // Buscar
    document.getElementById('search-btn').addEventListener('click', () => {
        filtros.busqueda = document.getElementById('search-input').value;
        filtros.categoria = ''; // Reset categoría
        document.getElementById('category-filter').value = '';
        skip = 0;
        cargarProductos();
    });
    //dar enter 
    document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('search-btn').click();
    }   
    });
    // Abrir modal nuevo
    document.getElementById('new-product-btn').addEventListener('click', abrirModalNuevo);

    // Cerrar modales (Botones X)
    document.getElementById('close-modal').addEventListener('click', () => cerrarModal('edit-modal'));
    document.getElementById('close-new-modal').addEventListener('click', () => cerrarModal('new-modal'));

    // Botones Cancelar
    document.getElementById('cancel-edit').addEventListener('click', () => cerrarModal('edit-modal'));
    document.getElementById('cancel-new').addEventListener('click', () => cerrarModal('new-modal'));

    // Botones Guardar/Crear
    document.getElementById('save-edit').addEventListener('click', guardarEdicion);
    document.getElementById('save-new').addEventListener('click', crearProducto);

    // Filtrar Categoría
    document.getElementById('category-filter').addEventListener('change', (e) => {
        filtros.categoria = e.target.value;
        filtros.busqueda = ''; // Reset búsqueda
        document.getElementById('search-input').value = '';
        skip = 0;
        cargarProductos();
    });

    // Ordenar
    document.getElementById('sort-filter').addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
            const [campo, tipo] = val.split('-');
            filtros.ordenar = { campo, tipo };
        } else {
            filtros.ordenar = null;
        }
        skip = 0;
        cargarProductos();
    });

    // Botones de página
    document.getElementById('next-btn').addEventListener('click', () => { skip += limit; cargarProductos(); });
    document.getElementById('prev-btn').addEventListener('click', () => { skip -= limit; cargarProductos(); });
    

    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('error');
            if (input.nextElementSibling?.classList.contains('error-message')) {
                input.nextElementSibling.remove();
            }
        });
    });
});



// Funciones de ayuda (Modal)
const cerrarModal = (id) => document.getElementById(id).classList.remove('active');
const abrirModalNuevo = () => document.getElementById('new-modal').classList.add('active');
const abrirModalEditar = (id) => {
    fetch(`${URL_BASE}/${id}`)
        .then(res => res.json())
        .then(p => {
            document.getElementById('edit-id').value = p.id;
            document.getElementById('edit-title').value = p.title;
            document.getElementById('edit-price').value = p.price;
            document.getElementById('edit-stock').value = p.stock;
            document.getElementById('edit-description').value = p.description;
            document.getElementById('edit-modal').classList.add('active');
        });
};