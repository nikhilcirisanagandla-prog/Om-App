import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import scriptures from '../data/scriptures.json';
import { useAuth } from '../components/AuthContext';

export default function DashboardScreen({ streak = 0, updateStreak }) {
  const [dailyVerse, setDailyVerse] = useState(null);
  const { profile } = useAuth();  // For personalization (e.g., deity)
  const [hasMarkedToday, setHasMarkedToday] = useState(false);

  useEffect(() => {
    // Rotate verse based on day (includes Ramayan)
    const today = new Date().getDate();
    const verseIndex = Math.floor(today % scriptures.length);
    setDailyVerse(scriptures[verseIndex]);
  }, []);

  // Check if already marked today
  useEffect(() => {
    const checkIfMarkedToday = async () => {
      try {
        const today = new Date().toDateString();
        const lastMarked = await AsyncStorage.getItem('last_devotion_date');
        setHasMarkedToday(lastMarked === today);
      } catch (error) {
        console.error('Error checking devotion status:', error);
      }
    };
    checkIfMarkedToday();
  }, [streak]);

  const handleDevote = async () => {
    if (hasMarkedToday) {
      Alert.alert('Already Complete', 'You have already completed your daily devotion today! Come back tomorrow.');
      return;
    }

    try {
      const newStreak = streak + 1;
      await updateStreak(newStreak);
      
      const today = new Date().toDateString();
      await AsyncStorage.setItem('last_devotion_date', today);
      setHasMarkedToday(true);

      const deity = profile?.deity || 'the Divine';
      Alert.alert(
        'Jai Shri Ram! ॐ', 
        `Daily devotion complete. Streak: ${newStreak} days. May ${deity} bless your path.`
      );
    } catch (error) {
      console.error('Devotion error:', error);
      Alert.alert('Error', 'Sync failed. Try again or check connection.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Daily Hindu Wisdom</Text>
      <Text style={styles.subtitle}>
        {profile?.deity ? `Dedicated to ${profile.deity}` : 'Follow your sacred path'}
      </Text>
      
      {/* Streak Display */}
      <View style={styles.streakCard}>
        <Text style={styles.streakTitle}>🕉️ Your Devotion Streak</Text>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakLabel}>days</Text>
        {hasMarkedToday && (
          <Text style={styles.completedBadge}>✅ Completed Today!</Text>
        )}
      </View>

      {dailyVerse && (
        <View style={styles.card}>
          <Text style={styles.verse}>"{dailyVerse.text}"</Text>
          <Text style={styles.source}>- {dailyVerse.source}</Text>
          <Text style={styles.note}>Reflect on this verse in your puja or meditation.</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={[styles.button, hasMarkedToday && styles.buttonDisabled]} 
        onPress={handleDevote}
        disabled={hasMarkedToday}
      >
        <Text style={styles.buttonText}>
          {hasMarkedToday ? '✅ Devotion Complete Today' : `Mark Today's Devotion`}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.ritual}>
        Suggested Practice: Chant a mantra, light a diya, or read from Ramayan/Gita.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#87CEEB',  // Sky blue background
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#FFD700',  // Gold title
    textAlign: 'center', 
    marginVertical: 20 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#FFFFFF', 
    textAlign: 'center', 
    marginBottom: 10,
    fontStyle: 'italic'
  },
  streakCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    elevation: 5,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A148C',
    marginBottom: 10,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  streakLabel: {
    fontSize: 16,
    color: '#795548',
    marginTop: 5,
  },
  completedBadge: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 10,
  },
  card: { 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 10, 
    marginVertical: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.1,
    elevation: 3  // Android shadow
  },
  verse: { 
    fontSize: 18, 
    fontStyle: 'italic', 
    textAlign: 'center', 
    marginBottom: 10,
    color: '#4A148C'  // Deep purple for sanctity
  },
  source: { 
    fontSize: 14, 
    color: '#FFD700',  // Gold source
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  note: { 
    fontSize: 14, 
    color: '#795548', 
    textAlign: 'center', 
    marginTop: 10,
    fontStyle: 'italic'
  },
  button: { 
    backgroundColor: '#FFD700',  // Gold button
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginVertical: 20 
  },
  buttonDisabled: {
    backgroundColor: '#C0C0C0',  // Gray when disabled
    opacity: 0.7,
  },
  buttonText: { 
    color: '#4A148C',  // Deep purple text
    fontWeight: 'bold', 
    fontSize: 16,
    textAlign: 'center'
  },
  ritual: { 
    fontSize: 14, 
    color: '#FFFFFF', 
    textAlign: 'center', 
    marginTop: 10,
    lineHeight: 20
  },
});