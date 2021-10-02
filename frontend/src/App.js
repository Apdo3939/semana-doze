import { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import './App.css';
import api from './configApi';

let socket;

function App() {

  const URL_BACKEND = "http://localhost:8081/";

  const [logado, setLogado] = useState(false);
  const [nome, setNome] = useState("");
  const [idUser, setIdUser] = useState("");
  const [email, setEmail] = useState("");
  const [sala, setSala] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [listaMensagem, setListaMensagem] = useState([]);
  const [salas, setSalas] = useState([]);
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const conectarSala = async e => {
    e.preventDefault();
    const headers = {
      'Content-Type': 'application/json'
    }
    await api.post('/login', { email }, { headers })
      .then((response) => {
        console.log(response.data.user);
        setNome(response.data.user.nome);
        setIdUser(response.data.user.id);
        setLogado(true);
        socket.emit("sala_conectar", sala);
        listarMensagens();
      })
      .catch((err) => {
        if (err.response) {
          setStatus({
            type: "erro",
            message: err.response.data.message,
          });
        }
        else {
          setStatus({
            type: "erro",
            message: "Tente mais tarde!",
          });
        }
      })
  }

  const listarMensagens = async () => {
    await api.get('/list-messages/' + sala)
      .then((response) => {
        console.log(response.data.data);
        setListaMensagem(response.data.data);
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response.data.message)
        }
        else {
          console.log('Tente mais tarde!')
        }
      });
  }

  const listarSalas = async () => {
    await api.get('/list-salas/')
      .then((response) => {
        setSalas(response.data.salas);
      })
      .catch((err) => {
        if (err.response) {
          setStatus({
            type: "erro",
            message: err.response.data.message,
          });
        }
        else {
          setStatus({
            type: "erro",
            message: "Tente mais tarde!",
          });
        }
      });
  }

  const enviarMensagem = async e => {
    e.preventDefault();
    const conteudoMensagem = {
      sala,
      conteudo: {
        mensagem,
        user: {
          id: idUser,
          nome
        }
      }
    }
    await socket.emit("enviar_mensagem", conteudoMensagem);
    setListaMensagem([...listaMensagem, conteudoMensagem.conteudo]);
    setMensagem("");
    listarMensagens();
  }

  useEffect(() => {
    socket = socketIOClient(URL_BACKEND);
    listarSalas();
  }, []);

  useEffect(() => {
    socket.on("receber_mensagem", (data) => {
      setListaMensagem([...listaMensagem, data]);
    })
  }, [listaMensagem]);

  return (
    <div className="Container">
      {!logado ?
        <div className="Content">
          <h1 className="Header">Chat</h1>
          {status.type === "erro" ? <p className="AlertErr">{status.message}</p> : ""}
          <form onSubmit={conectarSala} className="Form">
            <div className="Input">
              <label>Email: </label>
              <input
                type="email"
                placeholder="email"
                name="email" value={email}
                onChange={(text) => { setEmail(text.target.value) }}
              />
            </div>

            <div className="Input">
              <label>Sala: </label>
              <select
                name="sala"
                value={sala}
                onChange={(text) => { setSala(text.target.value) }}
              >
                <option value="">Selecione</option>
                {salas.map((sala) => {
                  return (
                    <option key={sala.id} value={sala.id}>{sala.nome}</option>
                  )
                })}
              </select>
            </div>
            <div className="ContentButton">
              <button type="submit">Conectar</button>
              <a href="/">Cadastra-se</a>
            </div>
          </form>
        </div>
        :
        <div className="Content">
          <div className="HeaderContent">
            <img src="avatar.png" alt={`Usuario: ${nome}`} />
            <h3>{nome}</h3>
          </div>
          <form onSubmit={enviarMensagem} className="InputContent">
            <input
              type="text"
              name="mensagem"
              placeholder="Mensagem..."
              value={mensagem}
              onChange={(text) => { setMensagem(text.target.value) }}
            />
            <button type="submit">Enviar</button>
          </form>
          <div className="MessageContent">
            {listaMensagem.map((msg, key) => {
              return (
                <div key={key}>
                  {idUser === msg.user.id ?
                    <div className="MessageSender">
                      <div className="MessageSenderDet">
                        <p>{msg.user.nome} : {msg.message}</p>
                      </div>
                    </div>
                    :
                    <div className="MessageReceive">
                      <div className="MessageReceiveDet">
                        <p>{msg.user.nome} : {msg.message}</p>
                      </div>
                    </div>
                  }
                </div>
              )
            })}
          </div>
        </div>
      }
    </div>
  );
}

export default App;
