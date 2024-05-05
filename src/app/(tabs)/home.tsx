import analyzeDocument from "@/src/lib/scanInvoice";
import { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import Fab from '@/src/components/Fab';

export default function Home() {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].base64) {
      await handleImage(result.assets[0].base64);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].base64) {
      await handleImage(result.assets[0].base64);
    }
  };

  const handleImage = async (base64Image: string) => {
    try {
      const result = await analyzeDocument(base64Image);
      console.log(JSON.stringify(result, null, 2));
      console.log("Document analysis succeeded");
    } catch (error) {
      console.error("Document analysis failed", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Home Page</Text>
      <Fab onTakePhoto={takePhoto} onPickImage={pickImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
