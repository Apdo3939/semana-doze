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
    <div className="App">
      <h1>Chat</h1>
      {!logado ?
        <>
          <div>
            <label>Nome: </label>
            <input type="text" placeholder="Nome" name="nome" value={nome} onChange={(text) => { setNome(text.target.value) }} />
          </div>
          <div>
            <label>Sala: </label>
            <select name="sala" value={sala} onChange={(text) => { setSala(text.target.value) }} >
              <option value="">Selecione</option>
              <option value="1">Node.js</option>
              <option value="2">React</option>
              <option value="3">React Native</option>
              <option value="4">Next</option>
            </select>
          </div>
          <div>
            <button onClick={conectarSala}>Conectar</button>
          </div>
        </>
        :
        <>
          {listaMensagem.map((msg, key) => {
            return (
              <div key={key}>
                {msg.nome}: {msg.mensagem}
              </div>
            )
          })}
          <input type="text" name="mensagem" placeholder="Mensagem..." value={mensagem} onChange={(text) => { setMensagem(text.target.value) }} />

          <button onClick={enviarMensagem}>Enviar</button>
        </>
      }
    </div>
  );
}

export default App;
