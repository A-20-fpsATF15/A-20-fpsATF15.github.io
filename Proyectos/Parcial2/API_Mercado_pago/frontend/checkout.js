// ============================================
// CHECKOUT.JS - Conecta Frontend con Backend
// ============================================

// ⚠️ Tu PUBLIC KEY de prueba de Mercado Pago
const MP_PUBLIC_KEY = 'APP_USR-f1d39f02-0a62-42f6-a453-9253099a4de9';

// ⚠️ URL de tu backend
const BACKEND_URL = 'http://localhost:3000';

// ── LEER DATOS DEL PRODUCTO DESDE LA URL ─────
// Ejemplo: checkout.html?nombre=Coca+Cola&precio=20&descripcion=Refresco
function obtenerParam(nombre) {
    return new URLSearchParams(window.location.search).get(nombre);
}

const producto = {
    nombre:      obtenerParam('nombre')      || 'Producto de prueba',
    precio:      parseFloat(obtenerParam('precio'))  || 499.00,
    descripcion: obtenerParam('descripcion') || 'Descripción del producto',
    cantidad:    parseInt(obtenerParam('cantidad'))  || 1
};

// ── INICIALIZAR MERCADO PAGO SDK ──────────────
const mp = new MercadoPago(MP_PUBLIC_KEY);

// ── CUANDO CARGA LA PÁGINA ────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Mostrar datos del producto en el resumen izquierdo
    document.getElementById('summary-nombre').textContent = producto.nombre;
    document.getElementById('summary-desc').textContent   = producto.descripcion;
    document.getElementById('summary-precio').textContent = formatPrecio(producto.precio);
    document.getElementById('summary-total').textContent  = `${formatPrecio(producto.precio)} MXN`;

    // Escuchar el formulario de tarjeta
    document.getElementById('form-card').addEventListener('submit', manejarPagoTarjeta);

    // Formatear número de tarjeta en tiempo real (agrega espacios)
    document.getElementById('cardNumber').addEventListener('input', (e) => {
        let v = e.target.value.replace(/\\D/g, '');
        e.target.value = v.match(/.{1,4}/g)?.join(' ') || v;
    });

    // Mostrar opción pro por defecto
    document.querySelector('#option-pro .option-body').style.display = 'block';

    console.log('✅ Checkout listo | Producto:', producto);
});

// ── OPCIÓN A: CHECKOUT PRO ────────────────────
// Crea una preferencia en tu backend y redirige a Mercado Pago
async function pagarConCheckoutPro() {
    const btn = document.getElementById('btn-checkout-pro');
    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Preparando...';
    mostrarLoading(true);

    try {
        // 1. Llamar al backend con fetch()
        const respuesta = await fetch(`${BACKEND_URL}/api/crear-preferencia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                titulo:      producto.nombre,
                precio:      producto.precio,
                cantidad:    producto.cantidad,
                descripcion: producto.descripcion
            })
        });

        const data = await respuesta.json();
        console.log('📦 Preferencia creada:', data);

        if (data.error) throw new Error(data.error);

        // 2. Redirigir a Mercado Pago
        // sandbox_init_point = modo prueba
        // init_point         = modo producción
        window.location.href = data.sandbox_init_point;

    } catch (error) {
        console.error('❌ Error:', error);
        mostrarMensaje('Error al conectar con el servidor. ¿Está corriendo el backend?', 'error');
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Continuar con Mercado Pago';
    } finally {
        mostrarLoading(false);
    }
}

// ── OPCIÓN B: PAGO CON TARJETA ────────────────
async function manejarPagoTarjeta(e) {
    e.preventDefault();
    if (!validarFormulario()) return;

    const btn = document.getElementById('btn-card-pay');
    btn.disabled = true;
    mostrarLoading(true);

    try {
        // 1. El SDK de MP convierte los datos de tarjeta en un TOKEN seguro
        //    Nunca mandamos el número de tarjeta directo al backend
        const token = await crearTokenTarjeta();
        if (!token) throw new Error('No se pudo tokenizar la tarjeta');

        // 2. Mandamos el TOKEN al backend con fetch()
        const respuesta = await fetch(`${BACKEND_URL}/api/procesar-pago`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token,
                transaction_amount: producto.precio,
                description:        producto.nombre,
                installments:       1,
                payment_method_id:  detectarTipoTarjeta(),
                payer: {
                    email: document.getElementById('email').value,
                    identification: {
                        type:   document.getElementById('identificationType').value,
                        number: document.getElementById('identificationNumber').value
                    }
                }
            })
        });

        const resultado = await respuesta.json();
        console.log('💳 Resultado:', resultado);
        manejarResultado(resultado);

    } catch (error) {
        console.error('❌ Error:', error);
        mostrarMensaje('Error al procesar el pago. Verifica los datos.', 'error');
    } finally {
        btn.disabled = false;
        mostrarLoading(false);
    }
}

// ── CREAR TOKEN DE TARJETA ────────────────────
async function crearTokenTarjeta() {
    try {
        const token = await mp.createCardToken({
            cardNumber:          document.getElementById('cardNumber').value.replace(/\\s/g, ''),
            cardholderName:      document.getElementById('cardholderName').value,
            cardExpirationMonth: document.getElementById('cardExpirationMonth').value,
            cardExpirationYear:  document.getElementById('cardExpirationYear').value,
            securityCode:        document.getElementById('securityCode').value,
            identificationType:  document.getElementById('identificationType').value,
            identificationNumber:document.getElementById('identificationNumber').value
        });
        return token.id;
    } catch (err) {
        console.error('Error al crear token:', err);
        return null;
    }
}

// ── DETECTAR TIPO DE TARJETA ──────────────────
function detectarTipoTarjeta() {
    const num = document.getElementById('cardNumber').value.replace(/\\s/g, '');
    if (num.startsWith('4'))                            return 'visa';
    if (num.startsWith('5'))                            return 'master';
    if (num.startsWith('34') || num.startsWith('37'))   return 'amex';
    return 'master';
}

// ── MANEJAR RESULTADO DEL PAGO ────────────────
function manejarResultado(resultado) {
    const mensajes = {
        approved:   { texto: '✅ ¡Pago aprobado exitosamente!',              tipo: 'exito'   },
        rejected:   { texto: `❌ Pago rechazado: ${resultado.status_detail}`, tipo: 'error'   },
        pending:    { texto: '⏳ Pago pendiente de confirmación',             tipo: 'pending' },
        in_process: { texto: '⏳ Pago en proceso, te notificaremos',          tipo: 'pending' }
    };

    const info = mensajes[resultado.status] || { texto: `Estado: ${resultado.status}`, tipo: 'error' };
    mostrarMensaje(info.texto, info.tipo);

    if (resultado.status === 'approved') {
        document.getElementById('form-card').reset();
    }
}

// ── TOGGLE OPCIONES ───────────────────────────
function toggleOption(tipo) {
    document.querySelectorAll('.pay-option').forEach(el => {
        el.classList.remove('active');
        el.querySelector('.option-body').style.display = 'none';
    });
    const sel = document.getElementById(`option-${tipo}`);
    sel.classList.add('active');
    sel.querySelector('.option-body').style.display = 'block';
}

// ── VALIDAR FORMULARIO ────────────────────────
function validarFormulario() {
    const campos = ['cardNumber','cardholderName','cardExpirationMonth',
                    'cardExpirationYear','securityCode','email',
                    'identificationType','identificationNumber'];

    for (const id of campos) {
        if (!document.getElementById(id).value.trim()) {
            mostrarMensaje('Por favor completa todos los campos', 'error');
            return false;
        }
    }

    const num = document.getElementById('cardNumber').value.replace(/\\s/g, '');
    if (num.length < 15 || num.length > 16) {
        mostrarMensaje('Número de tarjeta inválido', 'error');
        return false;
    }

    return true;
}

// ── HELPERS ───────────────────────────────────
function mostrarLoading(show) {
    document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
}

function mostrarMensaje(texto, tipo) {
    const el = document.getElementById('mensaje-resultado');
    el.textContent = texto;
    el.className = `mensaje ${tipo}`;
    el.style.display = 'block';
    if (tipo === 'exito') setTimeout(() => el.style.display = 'none', 6000);
}

function formatPrecio(n) {
    return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: 'MXN' 
    }).format(n);
}