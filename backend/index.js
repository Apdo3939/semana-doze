const express = require('express');
const socket = require("socket.io");
const cors = require("cors");
const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "X-PINGOTHER,Content-Type, Authorization");
    app.use(cors());
    next();
})

app.get('/', (req, res) => {
    res.send("Hello, Alexandre Pereira!");
});

const server = app.listen(8081, () => {
    console.log('Servidor rodando na porta 8081, http://localhost:8081')
});

const io = socket(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    console.log(socket.id);
})