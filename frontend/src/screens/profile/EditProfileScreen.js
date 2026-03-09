import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditProfileScreen({ navigation }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await AsyncStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setName(parsed.name);
      setEmail(parsed.email);
    }
  };

  const saveProfile = async () => {
    const updatedUser = { name, email };

    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

    Alert.alert("Success", "Profile updated");

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Name"
      />

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />

      <Pressable style={styles.button} onPress={saveProfile}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:20},
  title:{fontSize:22,fontWeight:"bold",marginBottom:20},
  input:{borderWidth:1,borderColor:"#ccc",padding:12,borderRadius:8,marginBottom:12},
  button:{backgroundColor:"#111",padding:14,borderRadius:8,alignItems:"center"},
  buttonText:{color:"#fff",fontWeight:"bold"}
});