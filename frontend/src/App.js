import { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import './App.css';

let socket;

function App() {

  const URL_BACKEND = "http://localhost:8081/";

  const [logado, setLogado] = useState(false);
  const [nome, setNome] = useState("");
  const [sala, setSala] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [listaMensagem, setListaMensagem] = useState([]);

  const conectarSala = () => {
    setLogado(true);
    socket.emit("sala_conectar", sala);
  }

  const enviarMensagem = async () => {
    console.log("Mensagem enviada " + mensagem);
    const conteudoMensagem = {
      sala,
      conteudo: {
        nome,
        mensagem
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

          <div className="Form">
            <div className="Input">
              <label>Nome: </label>
              <input
                type="text"
                placeholder="Nome"
                name="nome" value={nome}
                onChange={(text) => { setNome(text.target.value) }}
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

            <button onClick={conectarSala}>Conectar</button>

          </div>

        </div>
        :
        <div className="Content">
          <div className="HeaderContent">
            <img src="avatar.png" alt={`Usuario: ${nome}`} />
            <h3>{nome}</h3>
          </div>
          <div className="InputContent">
            <input
              type="text"
              name="mensagem"
              placeholder="Mensagem..."
              value={mensagem}
              onChange={(text) => { setMensagem(text.target.value) }}
            />
            <button onClick={enviarMensagem}>Enviar</button>
          </div>
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
