const express = require('express');
const socket = require("socket.io");
const cors = require("cors");
const app = express();

app.use(express.json());

const User = require('./models/User');
const Message = require('./models/Message');
const Sala = require('./models/Sala');

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "X-PINGOTHER,Content-Type, Authorization");
    app.use(cors());
    next();
})

app.get('/list-messages/:sala', async (req, res) => {
    const { sala } = req.params;
    await Message.findAll({
        order: [['id', 'ASC']],
        where: { salaId: sala },
        include: [{
            model: User
        },
        {
            model: Sala
        }],
    })
        .then((data) => {
            return res.json({
                err: false,
                data
            });
        })
        .catch(() => {
            return res.status(400).json({
                err: true,
                message: 'Nenhuma mensagem(s) encontrada(s)!',
            });
        })

});

app.get('/list-messages-mob/:sala', async (req, res) => {
    const { sala } = req.params;
    await Message.findAll({
        order: [['id', 'DESC']],
        where: { salaId: sala },
        include: [{
            model: User
        },
        {
            model: Sala
        }],
    })
        .then((data) => {
            return res.json({
                err: false,
                data
            });
        })
        .catch(() => {
            return res.status(400).json({
                err: true,
                message: 'Nenhuma mensagem(s) encontrada(s)!',
            });
        })

});

app.get('/list-salas', async (req, res) => {
    await Sala.findAll({
        order: [['nome', 'ASC']],
    })
        .then((salas) => {
            return res.json({
                err: false,
                salas
            });
        })
        .catch(() => {
            return res.status(400).json({
                err: true,
                message: 'Nenhuma sala(s) encontrada(s)!',
            });
        })

});

app.post('/create-room', async (req, res) => {
    const data = req.body;

    await Sala.create(data)
        .then(() => {
            return res.json({
                err: false,
                message: 'Sala Cadastrada!',
                data
            });
        })
        .catch(() => {
            return res.status(400).json({
                err: true,
                message: 'Sala n??o Cadastrado!',
            });
        })
});

app.post('/create-message', async (req, res) => {
    const data = req.body;

    await Message.create(data)
        .then(() => {
            return res.json({
                err: false,
                message: 'Messagem Cadastrada!',
                data
            });
        })
        .catch(() => {
            return res.status(400).json({
                err: true,
                message: 'Messagem n??o Cadastrado!',
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
                message: 'N??o Cadastrado!',
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
            message: 'Usu??rio n??o encontrado!',
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
    socket.on("sala_conectar", (data) => {
        console.log("Sala selecionada " + data);
        socket.join(Number(data));
    });
    socket.on("enviar_mensagem", (data) => {
        console.log(data);
        Message.create({
            message: data.conteudo.mensagem,
            salaId: data.sala,
            userId: data.conteudo.user.id
        });
        socket.to(Number(data.sala)).emit("receber_mensagem", data.conteudo);
    });
});