import React, { useEffect, useState } from "react";
import { Text, TextInput, StyleSheet, View, Button } from "react-native";
import socketIOClient from "socket.io-client";

let socket;

function Chat() {

    const ENDPOINT = "http://192.168.1.4:8081";

    const [logado, setLogado] = useState(false);
    const [nome, setNome] = useState("Alex Brown");
    const [idUser, setIdUser] = useState("2")
    const [email, setEmail] = useState("alex@exemplo.com.br");
    const [sala, setSala] = useState("1");
    const [mensagem, setMensagem] = useState("");
    const [listarMensagem, setListarMensagem] = useState([]);

    const conectarSala = () => {
        console.log(email + " " + sala);
        setLogado(true);
        socket.emit("sala_conectar", sala);
    }

    const enviarMensagem = async () => {
        console.log("Mensagem: " + mensagem);
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
        console.log(conteudoMensagem);
        await socket.emit("enviar_mensagem", conteudoMensagem);
        setListarMensagem([...listarMensagem, conteudoMensagem.conteudo]);
        setMensagem("");
    }

    useEffect(() => {
        socket = socketIOClient(ENDPOINT);
    }, []);

    useEffect(() => {
        socket.on("receber_mensagem", (data) => {
            setListarMensagem([...listarMensagem, data]);
        });
    }, [listarMensagem]);

    return (
        <View style={styles.container}>
            {!logado ?
                <>
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
                    <TextInput
                        style={styles.input}
                        autoCompleteType={false}
                        placeholder="Sala"
                        value={sala}
                        onChangeText={(texto) => { setSala(texto) }}
                    />
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
                                <Text>{msg.user.nome}: {msg.mensagem}</Text>
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