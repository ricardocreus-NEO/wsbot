const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// 1. CONFIGURACIÓN: Reemplazá con tus datos de Meta Developers
const TOKEN_VERIFICACION = "mi_token_secreto_123"; // El que vas a inventar en Meta
const TOKEN_ACCESO_META = "PEGÁ_ACÁ_TU_TOKEN_DE_ACCESO_TEMPORAL"; 
const ID_TELEFONO_PRUEBA = "PEGÁ_ACÁ_EL_ID_DE_TELÉFONO_DE_META"; 

// 2. RUTA PARA VALIDAR EL WEBHOOK (Paso obligatorio de Meta)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === TOKEN_VERIFICACION) {
            console.log('¡Webhook verificado con éxito!');
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403);
        }
    }
});

// 3. RUTA PARA RECIBIR MENSAJES Y RESPONDER AUTOMÁTICAMENTE
app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;

        if (body.object === 'whatsapp_business_account' && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
            const message = body.entry[0].changes[0].value.messages[0];
            const telefonoCliente = message.from; // Número de quien te escribió
            const tipoMensaje = message.type;

            // Evitamos responder si no es un mensaje de texto
            if (tipoMensaje === 'text') {
                console.log(`Mensaje recibido de ${telefonoCliente}: ${message.text.body}`);

                // Enviamos la respuesta automática usando la API de Meta
                await axios.post(
                    `https://facebook.com{ID_TELEFONO_PRUEBA}/messages`,
                    {
                        messaging_product: "whatsapp",
                        recipient_type: "individual",
                        to: telefonoCliente,
                        type: "text",
                        text: { body: "¡Hola! Recibí tu mensaje. Soy un bot en etapa de prueba. 🤖" }
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${TOKEN_ACCESO_META}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log('Respuesta automática enviada.');
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('Error al procesar el mensaje:', error.response?.data || error.message);
        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
