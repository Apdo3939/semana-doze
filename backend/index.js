const express = require('express');
const socket = require("socket.io");
const cors = require("cors");
const app = express();

app.use(express.json());

const User = require('./models/User');
const Message = require('./models/Message');

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

app.post('/create-message', async (req, res) => {
    const data = req.body;

    await Message.create(data)
        .then(() => {
            return res.json({
                err: false,
                message: 'Messagem Cadastrado!',
                data
            });
        })
        .catch(() => {
            return res.status(400).json({
                err: true,
                message: 'Messagem não Cadastrado!',
            });
        })
});

app.post('/create', async (req, res) => {
    const data = req.body;
    const user = await User.findOne({
        where: {
            email: data.email
        }
    })

    if (user) {
        return res.status(400).json({
            err: true,
            message: 'Email cadastrado, por favor usar outro email!',
        })
    }
    await User.create(data)
        .then(() => {
            return res.json({
                err: false,
                message: 'Cadastrado!',
                data
            });
        })
        .catch(() => {
            return res.status(400).json({
                err: true,
                message: 'Não Cadastrado!',
            });
        })
});

app.post('/login', async (req, res) => {
    const user = await User.findOne({
        attributes: ['id', 'nome'],
        where: {
            email: req.body.email
        }
    });

    if (user === null) {
        return res.status(404).json({
            err: true,
            message: 'Usuário não encontrado!',
        });
    }

    return res.json({
        err: false,
        message: 'Login realizado com sucesso!',
        user
    })
})

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
        Message.create({
            message: data.conteudo.mensagem,
            salaId: data.sala,
            userId: data.conteudo.user.id
        });
        socket.to(data.sala).emit("receber_mensagem", data.conteudo);
    });
})