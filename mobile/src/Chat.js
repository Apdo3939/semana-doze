import React, { useEffect, useState } from "react";
import { Text, TextInput, StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, FlatList } from "react-native";
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
        setListarMensagem([conteudoMensagem.conteudo, ...listarMensagem]);
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
        await api.get('/list-messages-mob/' + Number(sala))
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
            setListarMensagem([data, ...listarMensagem]);
            listarMensagens();
        });
    });

    return (
        <>
            {!logado ?
                <SafeAreaView style={styles.container}>
                    <ScrollView>
                        <Text style={styles.title}>Chat</Text>
                        {status.type === 'erro' ? <Text>Usuario não encontrado</Text> : <Text></Text>}
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCompleteType="off"
                            placeholder="Email"
                            value={email}
                            onChangeText={(texto) => { setEmail(texto) }}
                        />
                        <Text style={styles.label}>Sala</Text>
                        {salas.map((detSala) => {
                            return (
                                <View key={detSala.id} style={styles.radio}>
                                    <RadioButton
                                        value={detSala.id}
                                        status={sala === detSala.id ? 'checked' : 'unchecked'}
                                        onPress={() => setSala(detSala.id)}
                                    />
                                    <Text style={styles.radioTexto}>
                                        {detSala.nome}
                                    </Text>
                                </View>
                            )
                        })}
                        <TouchableOpacity
                            style={styles.btnConectar}
                            onPress={conectarSala}
                        ><Text style={styles.btnConectarTitulo}>Conectar</Text></TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
                :
                <SafeAreaView style={styles.container}>
                    <View>
                        <Text style={styles.title}>Nome: {nome}  Sala: {sala}</Text>
                    </View>

                    <FlatList
                        data={listarMensagem}
                        renderItem={({ item }) => (
                            <>
                                {item.user.id === idUser
                                    ?
                                    <View style={styles.containerChatSender}>
                                        <Text style={styles.containerChatTextSender}>{item.user.nome}: {item.message}</Text>
                                    </View>
                                    :
                                    <View style={styles.containerChatReceiver}>
                                        <Text style={styles.containerChatTextReceiver}>{item.user.nome}: {item.message}</Text>
                                    </View>
                                }
                            </>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />

                    <View style={styles.formContent}>
                        <TextInput
                            style={styles.inputMessage}
                            placeholder="mensagem..."
                            value={mensagem}
                            onChangeText={(texto) => { setMensagem(texto) }}
                        />
                        <TouchableOpacity
                            onPress={enviarMensagem}
                            style={styles.btnEnviar}
                        >
                            <Text style={styles.btnConectarTitulo}>Enviar</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            }
        </>
    )
}

export const styles = StyleSheet.create({
    container: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#e1e1e1'
    },
    title: {
        fontSize: 24,
        color: "#009900",
        textAlign: "center",
        marginBottom: 16,
        fontWeight: "700"
    },
    subTitle: {
        fontSize: 16,
        color: "#000099",
        textAlign: "left",
        marginBottom: 16,
        fontWeight: "500"
    },

    label: {
        fontSize: 16,
        color: "#000099",
        textAlign: "left",
        marginTop: 16
    },
    input: {
        height: 40,
        borderWidth: 1,
        padding: 10,
        marginVertical: 10,
        borderRadius: 8,
        borderColor: "#000099",
        color: "#000099",
        fontSize: 16
    },

    radio: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4
    },

    radioTexto: {
        fontSize: 16,
        color: "#000099",
        textAlign: "left",
    },

    btnConectar: {
        height: 40,
        backgroundColor: "#e1e1e1",
        borderWidth: 1,
        borderColor: "#000099",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 24
    },
    btnConectarTitulo: {
        textAlign: "center",
        color: "#009900",
        fontSize: 24,
        fontWeight: "700"
    },
    btnEnviar: {
        height: 40,
        backgroundColor: "#e1e1e1",
        borderWidth: 1,
        borderColor: "#009900",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },

    inputMessage: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        padding: 10,
        marginRight: 10,
        borderRadius: 8,
        borderColor: "#009900",
        color: "#009900",
        fontSize: 16
    },

    formContent: {
        flexDirection: "row",
        width: "100%",
        marginVertical: 10,
        height: 50,
        alignItems: "center",
    },
    containerChatSender: {
        width: "60%",
        backgroundColor: "#00990080",
        borderRadius: 8,
        marginVertical: 4,
        padding: 8,
        alignSelf: "flex-end",
    },
    containerChatReceiver: {
        width: "60%",
        backgroundColor: "#00990020",
        borderRadius: 8,
        marginVertical: 4,
        padding: 8,
        alignSelf: "flex-start"
    },
    containerChatTextSender: {
        color: "#e1e1e1",
        fontSize: 18,
        textAlign: "right"
    },
    containerChatTextReceiver: {
        color: "#009900",
        fontSize: 18,
        textAlign: "left"
    },
})

export default Chat;