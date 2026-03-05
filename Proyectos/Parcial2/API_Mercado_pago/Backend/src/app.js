//aqui va express 
// ============================================
// APP.JS - SERVIDOR PRINCIPAL
// ============================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pagosRoutes = require('./routes/pagos.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARES ──────────────────────────────
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// ── RUTAS ────────────────────────────────────
app.use('/api', pagosRoutes);

// ── PRUEBA DE VIDA ───────────────────────────
app.get('/', (req, res) => {
    res.json({ 
        mensaje: '✅ Servidor funcionando',
        puerto: PORT
    });
});

// ── INICIAR SERVIDOR ─────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;