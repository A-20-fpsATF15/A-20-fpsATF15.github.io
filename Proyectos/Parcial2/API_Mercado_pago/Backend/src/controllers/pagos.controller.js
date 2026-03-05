//logica que habla con mercado pago 
// ============================================
// PAGOS.CONTROLLER.JS - LÓGICA DE PAGOS
// ============================================

const { MercadoPagoConfig, Payment, Preference } = require('mercadopago');
require('dotenv').config();

// ── CONFIGURAR MERCADO PAGO ──────────────────
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

const payment    = new Payment(client);
const preference = new Preference(client);

// ── CONTROLADORES ────────────────────────────

// GET /api/status - Prueba de vida en la api http://localhost:3000/api/status
const status = (req, res) => {
    res.json({ 
        status: 'online',
        mensaje: '✅ API de pagos funcionando',
        entorno: process.env.NODE_ENV
    });
};

const crearPreferencia = async (req, res) => {
    const { titulo, precio, cantidad, descripcion } = req.body;

    console.log('📦 Creando preferencia:', req.body);

    try {
        const result = await preference.create({
            body: {
                items: [{
                    title: titulo || 'Producto',
                    unit_price: parseFloat(precio),
                    quantity: parseInt(cantidad) || 1,
                    description: descripcion || ''
                }],
                back_urls: {
                    success: 'https://equipo6.grupoahost.com/resultado.html?status=approved',
                    failure: 'https://equipo6.grupoahost.com/resultado.html?status=rejected',
                    pending: 'https://equipo6.grupoahost.com/resultado.html?status=pending'
                },
                
            }
        });

        console.log('✅ Preferencia creada:', result.id);

        res.json({
            id: result.id,
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// POST /api/procesar-pago - Pago con tarjeta
const procesarPago = async (req, res) => {
    const { token, transaction_amount, description, 
            installments, payment_method_id, payer } = req.body;

    console.log('💳 Procesando pago...');

    try {
        const result = await payment.create({
            body: {
                token,
                transaction_amount: parseFloat(transaction_amount),
                description,
                installments: parseInt(installments) || 1,
                payment_method_id,
                payer: {
                    email: payer.email,
                    identification: payer.identification
                }
            }
        });

        console.log(`✅ Pago ${result.status} - ID: ${result.id}`);

        res.json({
            status: result.status,
            status_detail: result.status_detail,
            id: result.id
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// POST /api/webhook - Notificaciones de MP
const webhook = async (req, res) => {
    const { type, data } = req.body;
    console.log('🔔 Webhook recibido:', type, data);

    if (type === 'payment') {
        try {
            const pago = await payment.get({ id: data.id });
            console.log(`💰 Pago ${pago.id}: ${pago.status}`);
        } catch (error) {
            console.error('Error webhook:', error);
        }
    }

    res.sendStatus(200);
};

module.exports = { status, crearPreferencia, procesarPago, webhook };