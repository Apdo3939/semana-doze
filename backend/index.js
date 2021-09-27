const express = require('express');

const app = express();


app.get('/', (req, res) => {
    res.send("Hello, world!");
});

app.listen(8081, () => {
    console.log('Servidor rodando na porta 8081, http://localhost:8081')
});