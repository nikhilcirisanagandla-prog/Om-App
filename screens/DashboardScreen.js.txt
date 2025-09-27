import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import scriptures from '../data/scriptures.json';
import { useAuth } from '../components/AuthContext';

export default function DashboardScreen({ streak, updateStreak }) {
  const [dailyVerse, setDailyVerse] = useState(null);
  const { profile } = useAuth();  // For personalization (e.g., deity)

  useEffect(() => {
    // Rotate verse based on day (includes Ramayan)
    const today = new Date().getDate();
    const verseIndex = Math.floor(today % scriptures.length);
    setDailyVerse(scriptures[verseIndex]);
  }, []);

  const handleDevote = async () => {
    try {
      await updateStreak(streak + 1);
      const deity = profile.deity || 'the Divine';
      Alert.alert(
        'Jai Shri Ram! ॐ', 
        `Daily devotion complete. Streak updated to ${streak + 1} days. May ${deity} bless your path.`
      );
    } catch (error) {
      Alert.alert('Error', 'Sync failed. Try again or check connection.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Daily Hindu Wisdom</Text>
      <Text style={styles.subtitle}>
        {profile.deity ? `Dedicated to ${profile.deity}` : 'Follow your sacred path'}
      </Text>
      {dailyVerse && (
        <View style={styles.card}>
          <Text style={styles.verse}>"{dailyVerse.text}"</Text>
          <Text style={styles.source}>- {dailyVerse.source}</Text>
          <Text style={styles.note}>Reflect on this verse in your puja or meditation.</Text>
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={handleDevote}>
        <Text style={styles.buttonText}>
          Perform Daily Devotion & Update Streak ({streak} days)
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
    marginBottom: 20,
    fontStyle: 'italic'
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
  buttonText: { 
    color: '#87CEEB',  // Sky blue text
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