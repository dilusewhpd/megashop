import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";

export default function ChangePasswordScreen() {

  const [password,setPassword] = useState("");
  const [confirm,setConfirm] = useState("");

  const changePassword = () => {

    if(password !== confirm){
      Alert.alert("Error","Passwords do not match");
      return;
    }

    Alert.alert("Success","Password changed successfully");
  };

  return(
    <View style={styles.container}>

      <Text style={styles.title}>Change Password</Text>

      <TextInput
      style={styles.input}
      placeholder="New Password"
      secureTextEntry
      value={password}
      onChangeText={setPassword}
      />

      <TextInput
      style={styles.input}
      placeholder="Confirm Password"
      secureTextEntry
      value={confirm}
      onChangeText={setConfirm}
      />

      <Pressable style={styles.button} onPress={changePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </Pressable>

    </View>
  )
}

const styles = StyleSheet.create({
container:{flex:1,padding:20},
title:{fontSize:22,fontWeight:"bold",marginBottom:20},
input:{borderWidth:1,borderColor:"#ccc",padding:12,borderRadius:8,marginBottom:12},
button:{backgroundColor:"#111",padding:14,borderRadius:8,alignItems:"center"},
buttonText:{color:"#fff",fontWeight:"bold"}
});