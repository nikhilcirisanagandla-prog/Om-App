// screens/OnboardingScreen.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../utils/supabase';

export default function OnboardingScreen({ navigation }) {
  // Step tracker
  const [step, setStep] = useState(1);

  // Answers state
  const [age, setAge] = useState('');
  const [race, setRace] = useState('');
  const [familySize, setFamilySize] = useState('');
  const [goals, setGoals] = useState('');
  const [religion, setReligion] = useState('');
  const [hinduismKnowledge, setHinduismKnowledge] = useState('');

  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Go back one step
  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Validate current step input before moving forward
  const validateStep = () => {
    switch (step) {
      case 1:
        if (!age.trim()) {
          Alert.alert('Error', 'Please enter your age.');
          return false;
        }
        if (isNaN(age) || Number(age) <= 0) {
          Alert.alert('Error', 'Please enter a valid age.');
          return false;
        }
        return true;
      case 2:
        if (!race.trim()) {
          Alert.alert('Error', 'Please enter your race.');
          return false;
        }
        return true;
      case 3:
        if (!familySize.trim()) {
          Alert.alert('Error', 'Please enter your family size.');
          return false;
        }
        if (isNaN(familySize) || Number(familySize) <= 0) {
          Alert.alert('Error', 'Please enter a valid number for family size.');
          return false;
        }
        return true;
      case 4:
        if (!goals.trim()) {
          Alert.alert('Error', 'Please enter your goals.');
          return false;
        }
        return true;
      case 5:
        if (!religion.trim()) {
          Alert.alert('Error', 'Please enter your religion.');
          return false;
        }
        return true;
      case 6:
        if (!hinduismKnowledge.trim()) {
          Alert.alert('Error', 'Please enter your previous knowledge on Hinduism.');
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  // Move to next step or complete onboarding
  const nextStep = () => {
    if (!validateStep()) return;

    if (step < 6) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  // Save onboarding data and navigate to main app
  const completeOnboarding = async () => {
    setLoading(true);
    try {
      // Save onboarding completion flag locally
      await AsyncStorage.setItem('onboarding_complete', 'true');

      // Save all answers locally (optional)
      await AsyncStorage.setItem('user_age', age.trim());
      await AsyncStorage.setItem('user_race', race.trim());
      await AsyncStorage.setItem('user_family_size', familySize.trim());
      await AsyncStorage.setItem('user_goals', goals.trim());
      await AsyncStorage.setItem('user_religion', religion.trim());
      await AsyncStorage.setItem('user_hinduism_knowledge', hinduismKnowledge.trim());

      // Save to Supabase user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          age: Number(age.trim()),
          race: race.trim(),
          family_size: Number(familySize.trim()),
          goals: goals.trim(),
          religion: religion.trim(),
          hinduism_knowledge: hinduismKnowledge.trim(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert('Welcome to Om!', 'Your onboarding is complete.');

      // Navigate to main app tabs, replacing onboarding screen
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to complete onboarding.');
    } finally {
      setLoading(false);
    }
  };

  // Render question input based on current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.title}>How old are you?</Text>
            <TextInput
              label="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              returnKeyType="done"
            />
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.title}>What's your race?</Text>
            <TextInput
              label="Race"
              value={race}
              onChangeText={setRace}
              mode="outlined"
              style={styles.input}
              returnKeyType="done"
            />
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.title}>How many people are in your family?</Text>
            <TextInput
              label="Family Size"
              value={familySize}
              onChangeText={setFamilySize}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              returnKeyType="done"
            />
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.title}>What are your goals?</Text>
            <TextInput
              label="Goals"
              value={goals}
              onChangeText={setGoals}
              mode="outlined"
              multiline
              style={styles.input}
              returnKeyType="done"
            />
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.title}>What's your religion?</Text>
            <TextInput
              label="Religion"
              value={religion}
              onChangeText={setReligion}
              mode="outlined"
              style={styles.input}
              returnKeyType="done"
            />
          </>
        );
      case 6:
        return (
          <>
            <Text style={styles.title}>What previous knowledge do you have on Hinduism?</Text>
            <TextInput
              label="Previous Knowledge"
              value={hinduismKnowledge}
              onChangeText={setHinduismKnowledge}
              mode="outlined"
              multiline
              style={styles.input}
              returnKeyType="done"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Back button except on first step */}
      {step > 1 && (
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={goBack}
          style={styles.backButton}
          accessibilityLabel="Back"
        />
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {renderStep()}

        <Button
          mode="contained"
          onPress={nextStep}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          {step < 6 ? 'Next' : 'Complete'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    color: '#4a90e2',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});