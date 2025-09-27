import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../components/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signUp, signIn, loading } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('ॐ', 'Please enter email and password.');
      return;
    }
    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert('Namaste!', 'Account created. Complete your profile next. Jai Shri Ram!');
      } else {
        await signIn(email, password);
        Alert.alert('Welcome Back, Devotee! ॐ');
      }
      // Navigation handled by AuthContext
    } catch (error) {
      Alert.alert('Error', error.message || 'Auth failed. Try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Om: Hindu Faith Companion</Text>
      <Text style={styles.subtitle}>Sign up or login to begin your devotion</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
        <Text style={styles.buttonText}>{isSignUp ? 'Create Account' : 'Login'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.link}>
          {isSignUp ? 'Already have an account? Login' : 'New devotee? Sign up'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.note}>Secure & private – your faith journey synced across devices.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#87CEEB', padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#FFFFFF', textAlign: 'center', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#FFD700', padding: 15, marginVertical: 10, borderRadius: 8, backgroundColor: 'white' },
  button: { backgroundColor: '#FFD700', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  buttonText: { color: '#87CEEB', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#FFD700', textAlign: 'center', marginTop: 20 },
  note: { fontSize: 12, color: '#FFFFFF', textAlign: 'center', marginTop: 20 },
});