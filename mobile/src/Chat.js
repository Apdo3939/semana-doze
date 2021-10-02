import React, { useEffect, useState } from "react";
import { Text, TextInput, StyleSheet, View, Button } from "react-native";
import socketIOClient from "socket.io-client";

let socket;

function Chat() {

    const ENDPOINT = "http://192.168.1.4:8081";

    const [logado, setLogado] = useState(false);
    const [email, setEmail] = useState("");
    const [sala, setSala] = useState("");

    const conectarSala = () => {
        console.log(email + " " + sala);
        setLogado(true);
        socket.emit("sala_conectar", sala);
    }

    useEffect(() => {
        socket = socketIOClient(ENDPOINT);
    }, []);

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
                <Text>Chat!!!</Text>}
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