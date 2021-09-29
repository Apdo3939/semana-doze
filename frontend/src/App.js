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
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response.data.message)
        }
        else {
          console.log('Tente mais tarde!')
        }
      })
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
  }

  useEffect(() => {
    socket = socketIOClient(URL_BACKEND);
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
                <option value="1">Node.js</option>
                <option value="2">React</option>
                <option value="3">React Native</option>
                <option value="4">Next</option>
              </select>
            </div>

            <button type="submit">Conectar</button>

          </form>
        </div>
        :
        <div className="Content">
          <div className="HeaderContent">
            <img src="avatar.png" alt={`Usuario: ${nome}`} />
            <h3>{nome} {idUser}</h3>
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
                  {nome === msg.nome ?
                    <div className="MessageSender">
                      <div className="MessageSenderDet">
                        <p>{msg.mensagem}</p>
                      </div>
                    </div>
                    :
                    <div className="MessageReceive">
                      <div className="MessageReceiveDet">
                        <p>{msg.mensagem}</p>
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
