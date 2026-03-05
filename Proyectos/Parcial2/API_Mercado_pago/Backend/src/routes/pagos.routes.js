//rutas 
// ============================================
// PAGOS.ROUTES.JS - RUTAS DE LA API
// ============================================

const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagos.controller');

// Prueba de que las rutas funcionan
router.get('/status', pagosController.status);

// Crear preferencia (Checkout Pro - botón de MP)
router.post('/crear-preferencia', pagosController.crearPreferencia);

// Procesar pago con tarjeta (Checkout Transparente)
router.post('/procesar-pago', pagosController.procesarPago);

// Webhook - Mercado Pago nos avisa el resultado
router.post('/webhook', pagosController.webhook);

module.exports = router;