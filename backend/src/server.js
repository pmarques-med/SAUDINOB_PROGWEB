import "dotenv/config";

import { createServer } from "http";

import { WebSocketServer } from "ws";

import app from "./app.js";

import { initDatabase } from "./db/init.js";

const PORT = process.env.PORT || 3000;

// Inicializar a base de dados

initDatabase();

// Em vez de:

// app.listen(PORT, ...)

//

// criamos explicitamente um servidor HTTP.

// A aplicação Express continua a tratar os pedidos HTTP normais.

const server = createServer(app);

// Criamos um servidor WebSocket associado

// ao MESMO servidor HTTP.

const wss = new WebSocketServer({

    server,

    path: "/ws/vitals"

});

// Este evento ocorre sempre que um cliente

// estabelece uma nova ligação WebSocket.

wss.on("connection", (socket, request) => {

    // O patientId será recebido através da query string:

    //

    // ws://localhost:3000/ws/vitals?patientId=1

    const url = new URL(

        request.url,

        `http://${request.headers.host}`

    );

    const patientId = Number(

        url.searchParams.get("patientId")

    );

    // Verificação simples do parâmetro recebido.

    if (!Number.isInteger(patientId) || patientId <= 0) {

        socket.send(JSON.stringify({

            error: "Invalid patientId"

        }));

        socket.close();

        return;

    }

    console.log(

        `WebSocket aberto para o doente ${patientId}`

    );

    // Função que cria e envia uma leitura simulada.

    function sendHeartRate() {

        // Frequência cardíaca simulada entre 60 e 100 bpm.

        // O valor NÃO é armazenado na base de dados.

        const heartRate =

            Math.floor(Math.random() * 41) + 60;

        // Criamos o objeto que será enviado ao frontend.

        const data = {

            patientId: patientId,

            heartRate: heartRate,

            timestamp: new Date().toISOString()

        };

        // WebSocket envia texto.

        // Por isso convertemos o objeto para JSON.

        socket.send(

            JSON.stringify(data)

        );

    }

    // Enviamos imediatamente uma primeira leitura.

    sendHeartRate();

    // Depois enviamos automaticamente uma nova leitura

    // a cada 2 segundos.

    const interval = setInterval(

        sendHeartRate,

        2000

    );

    // Quando o cliente fecha a ligação,

    // devemos parar o setInterval.

    socket.on("close", () => {

        clearInterval(interval);

        console.log(

            `WebSocket fechado para o doente ${patientId}`

        );

    });

});

// Agora é o servidor HTTP que fica à escuta.

// Express e WebSocket utilizam a mesma porta.

server.listen(PORT, () => {

    console.log(

        `API disponível em http://localhost:${PORT}`

    );

    console.log(

        `WebSocket disponível em ws://localhost:${PORT}/ws/vitals`

    );

});