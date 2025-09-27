import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../components/AuthContext';

export default function OnboardingScreen({ navigation }) {
  const [deity, setDeity] = useState('');
  const [practice, setPractice] = useState('');
  const { completeProfile } = useAuth();

  const handleSubmit = () => {
    if (deity || practice) {
      completeProfile({ deity, practice });
      Alert.alert('ॐ', 'Your faith path is set. Jai Shri Ram!');
      navigation.replace('Main');
    } else {
      Alert.alert('Devotion Begins', 'Share your sacred interests.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Hindu Path</Text>
      <Text style={styles.subtitle}>What aspect of faith calls you?</Text>
      <TextInput
        style={styles.input}
        placeholder="Favorite deity (e.g., Rama, Krishna, Shiva)"
        value={deity}
        onChangeText={setDeity}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Daily practice (e.g., Puja, Festivals like Diwali)"
        value={practice}
        onChangeText={setPractice}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Dedicate to the Divine</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#87CEEB', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginTop: 50 },
  subtitle: { fontSize: 16, color: '#FFFFFF', textAlign: 'center', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#FFD700', padding: 15, marginVertical: 10, borderRadius: 8, backgroundColor: 'white', minHeight: 50 },
  button: { backgroundColor: '#FFD700', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#87CEEB', fontWeight: 'bold', fontSize: 16 },
});