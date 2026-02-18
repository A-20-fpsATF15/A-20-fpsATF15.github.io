// Datos de Cloudinary
const CLOUD_NAME = 'dmq79ypf8';
const UPLOAD_PRESET = 'SRmoon';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Referencias a elementos del DOM
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const preview = document.getElementById('preview');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const result = document.getElementById('result');
const uploadedImage = document.getElementById('uploadedImage');
const imageUrl = document.getElementById('imageUrl');

// Variable para guardar el archivo seleccionado
let archivoSeleccionado = null;

// Evento cuando el usuario selecciona un archivo
fileInput.addEventListener('change', (e) => {
    const archivo = fileInput.files[0];
    
    // Validar que sea una imagen
    if (!archivo) {
        return;
    }
    
    if (!archivo.type.startsWith('image/')) {
        mostrarError('Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF, etc.)');
        uploadBtn.disabled = true;
        archivoSeleccionado = null;
        return;
    }
    
    // Guardar el archivo y habilitar el boton
    archivoSeleccionado = archivo;
    uploadBtn.disabled = false;
    
    // Previsualizar la imagen antes de subirla
    const reader = new FileReader();
    reader.onload = (evento) => {
        preview.innerHTML = `<img src="${evento.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(archivo);
    
    // Limpiar mensajes anteriores
    error.classList.add('hidden');
    result.classList.add('hidden');
});

// Evento cuando el usuario da click en "Subir a Cloudinary"
uploadBtn.addEventListener('click', () => {
    if (!archivoSeleccionado) {
        mostrarError('Por favor selecciona una imagen primero');
        return;
    }
    
    subirImagenCloudinary(archivoSeleccionado);
});

// Función para subir la imagen a Cloudinary usando fetch y promesas
const subirImagenCloudinary = (archivo) => {
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    // Deshabilitar boton y mostrar indicador de carga
    uploadBtn.disabled = true;
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    result.classList.add('hidden');
    
    // Hacer la peticion a Cloudinary
    fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
    })
    .then(res => {
        // Verificar si la respuesta fue exitosa
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        console.log('Respuesta de Cloudinary:', data);
        
        // Ocultar indicador de carga
        loading.classList.add('hidden');
        
        // Mostrar la imagen subida exitosamente
        uploadedImage.src = data.secure_url;
        imageUrl.href = data.secure_url;
        imageUrl.textContent = data.secure_url;
        result.classList.remove('hidden');
        
        // Limpiar el input y preview
        fileInput.value = '';
        preview.innerHTML = '';
        archivoSeleccionado = null;
    })
    .catch(err => {
        console.error('Error al subir imagen:', err);
        
        // Ocultar indicador de carga
        loading.classList.add('hidden');
        
        // Mostrar mensaje de error
        mostrarError('Hubo un error al subir la imagen. Por favor intenta de nuevo.');
        
        // Rehabilitar el boton
        uploadBtn.disabled = false;
    });
};

// Función auxiliar para mostrar mensajes de error
const mostrarError = (mensaje) => {
    error.textContent = mensaje;
    error.classList.remove('hidden');
};