import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../utils/supabase';
import { generateHolyResponse } from '../utils/aiHolyChat';
import { useAuth } from '../contexts/AuthContext';

export default function ChatScreen({ streak }) {
  const [input, setInput] = useState('');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { profile, user } = useAuth();
  const userContext = { streak, profile };  // For personalization (deity, practice)

  // Load chat history from Supabase on mount
  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        try {
          const { data, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: true })
            .limit(50);  // Limit for performance
          if (error) {
            console.warn('Chat history fetch error:', error.message);
          } else if (data) {
            setResponses(
              data.map((item) => ({
                id: item.id,
                user: item.message,
                guru: item.response,
                timestamp: new Date(item.timestamp).toLocaleTimeString(),
                isUser: true,  // Fixed: For rendering user messages
              }))
            );
          }
        } catch (err) {
          console.error('Fetch history error:', err);
        }
      };
      fetchHistory();
    }
  }, [user]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message to list
    const userEntry = {
      id: Date.now().toString(),
      user: userMessage,
      guru: '',
      timestamp: new Date().toLocaleTimeString(),
      isUser: true,  // Fixed: User message
    };
    const tempResponses = [...responses, userEntry];
    setResponses(tempResponses);

    try {
      // Generate personalized guru response
      const guruResponse = await generateHolyResponse(userMessage, userContext);
      const guruEntry = {
        id: (Date.now() + 1).toString(),
        user: '',
        guru: guruResponse,
        timestamp: new Date().toLocaleTimeString(),
        isUser: false,  // Fixed: Guru message
      };

      // Update list with response
      const updatedResponses = [...tempResponses.slice(0, -1), guruEntry];
      setResponses(updatedResponses);

      // Save to Supabase (if logged in)
      if (user) {
        const { error } = await supabase.from('chat_history').insert([
          {
            user_id: user.id,
            message: userMessage,
            response: guruResponse,
            timestamp: new Date().toISOString(),
          },
        ]);
        if (error) {
          console.warn('Save chat history error:', error.message);
          // Still show response locally
        }
      }
    } catch (err) {
      console.error('Generate response error:', err);
      const errorEntry = {
        id: (Date.now() + 1).toString(),
        user: '',
        guru: 'ॐ Apologies, divine guidance is temporarily unavailable. Please try again. Shanti.',
        timestamp: new Date().toLocaleTimeString(),
        isUser: false,  // Fixed: Error as guru message
      };
      setResponses([...tempResponses.slice(0, -1), errorEntry]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={item.isUser ? styles.userMessage : styles.guruMessage}>
      <Text style={item.isUser ? styles.userText : styles.guruText}>
        {item.isUser ? item.user : item.guru}
      </Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Holy Guidance (Streak: {streak})</Text>
          {profile?.deity && (
            <Text style={styles.deityText}>Dedicated to {profile.deity}</Text>
          )}
        </View>

        <FlatList
          data={responses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.chatList}
          inverted  // Newest at bottom
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about dharma, mantras, or scriptures..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
            <Text style={styles.sendText}>{loading ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#4a90e2',  // Sky blue theme
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  deityText: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  chatList: {
    flex: 1,
    padding: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
    maxWidth: '80%',
  },
  guruMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
    maxWidth: '80%',
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  userText: {
    color: 'white',
    fontSize: 16,
  },
  guruText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    alignSelf: item.isUser ? 'flex-end' : 'flex-start',  // Fixed: Reference to item.isUser
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  sendText: {
    color: 'white',
    fontWeight: 'bold',
  },
});