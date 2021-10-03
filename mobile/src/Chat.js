import React, { useEffect, useState } from "react";
import { Text, TextInput, StyleSheet, View, Button } from "react-native";
import socketIOClient from "socket.io-client";
import api from './configApi';
import { RadioButton } from 'react-native-paper';

let socket;

function Chat() {

    const ENDPOINT = "http://192.168.1.4:8081";

    const [logado, setLogado] = useState(false);
    const [nome, setNome] = useState("");
    const [idUser, setIdUser] = useState("")
    const [email, setEmail] = useState("");
    const [sala, setSala] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [listarMensagem, setListarMensagem] = useState([]);
    const [salas, setSalas] = useState([]);
    const [status, setStatus] = useState({
        type: '',
        mensagem: ''
    });


    const conectarSala = async e => {
        e.preventDefault();
        const headers = {
            "Content-Type": "application/json"
        }
        await api.post('/login', { email }, headers)
            .then((response) => {
                setNome(response.data.user.nome);
                setIdUser(response.data.user.id);
                setLogado(true);
                socket.emit("sala_conectar", Number(sala));
                listarMensagens();
            })
            .catch((err) => {
                if (err.response) {
                    setStatus({
                        type: 'erro',
                        mensagem: err.response.data.mensagem
                    });
                } else {
                    setStatus({
                        type: 'erro',
                        mensagem: 'Tente mais tarde!'
                    });
                }
            });
    }

    const enviarMensagem = async () => {
        const conteudoMensagem = {
            sala: Number(sala),
            conteudo: {
                mensagem,
                user: {
                    id: idUser,
                    nome
                }
            }
        }
        await socket.emit("enviar_mensagem", conteudoMensagem);
        setListarMensagem([...listarMensagem, conteudoMensagem.conteudo]);
        listarMensagens();
        setMensagem("");
    }

    const listarSalas = async () => {
        await api.get('/list-salas')
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

    const listarMensagens = async () => {
        await api.get('/list-messages/' + sala)
            .then((response) => {
                setListarMensagem(response.data.data);
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

    useEffect(() => {
        socket = socketIOClient(ENDPOINT);
        listarSalas();
    }, []);

    useEffect(() => {
        socket.on("receber_mensagem", (data) => {
            setListarMensagem([...listarMensagem, data]);
            listarMensagens();
        });
    });

    return (
        <View style={styles.container}>
            {!logado ?
                <>
                    {status.type === 'erro' ? <Text>Usuario não encontrado</Text> : <Text></Text>}
                    <Text>Email</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCompleteType={false}
                        placeholder="Email"
                        value={email}
                        onChangeText={(texto) => { setEmail(texto) }}
                    />
                    <Text>Sala</Text>
                    {salas.map((detSala) => {
                        return (
                            <View key={detSala.id}>
                                <RadioButton
                                    value={detSala.id}
                                    status={sala === detSala.id ? 'checked' : 'unchecked'}
                                    onPress={() => setSala(detSala.id)}
                                />
                                <Text>
                                    {detSala.nome}
                                </Text>
                            </View>
                        )
                    })}
                    <Button
                        onPress={conectarSala}
                        title="Conectar"
                        color="#00cc0077" />
                </>

                :
                <>
                    <View>
                        <Text>Nome: {nome}  Sala: {sala}</Text>
                    </View>
                    <Text>Mensagem</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="mensagem..."
                        value={mensagem}
                        onChangeText={(texto) => { setMensagem(texto) }}
                    />
                    <Button
                        onPress={enviarMensagem}
                        title="Enviar"
                        color="#00cc0077" />

                    {listarMensagem.map((msg, key) => {
                        return (
                            <View key={key}>
                                <Text>{msg.user.nome}: {msg.message}</Text>
                            </View>
                        )
                    })}
                </>
            }
        </View>
    )
}

export const styles = StyleSheet.create({
    container: {
        padding: 25,
        flex: 1,
        backgroundColor: '#e1e1e1'
    },
    input: {
        height: 40,
        borderWidth: 1,
        padding: 10,
        marginVertical: 10,
        borderRadius: 12
    }
})

export default Chat;