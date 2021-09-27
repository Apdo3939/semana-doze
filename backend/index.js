const express = require('express');
const socket = require("socket.io");
const cors = require("cors");
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "X-PINGOTHER,Content-Type, Authorization");
    app.use(cors());
    next();
})

app.get('/', (req, res) => {
    res.send("Bem vindo Alexandre Pereira!");
});

const server = app.listen(8081, () => {
    console.log('Servidor rodando na porta 8081, http://localhost:8081')
});

io = socket(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    console.log(socket.id);
    socket.on("sala_conectar", (data) => {
        console.log("Sala selecionada " + data);
        socket.join(data);
    });
    socket.on("enviar_mensagem", (data) => {
        console.log(data);
        socket.to(data.sala).emit("receber_mensagem", data.conteudo);
    });
})