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
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import { generateHolyResponse } from '../components/generateHolyResponse';
import { useAuth } from '../components/AuthContext';

export default function ChatScreen({ streak }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);  // Renamed from 'responses' for clarity
  const [loading, setLoading] = useState(false);
  const { profile, user } = useAuth();
  const userContext = { streak, profile };

  // Load history: Local first, then merge Supabase
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const localKey = `chat_${user?.id || 'guest'}`;
        const localData = await AsyncStorage.getItem(localKey);
        let localMessages = [];
        if (localData) {
          localMessages = JSON.parse(localData);
          setMessages(localMessages);
        }

        // Sync Supabase (if logged in)
        if (user) {
          const { data, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })  // Use 'created_at' if 'timestamp' not set
            .limit(50);
          if (error) {
            console.warn('Supabase fetch error:', error.message);
          } else if (data && data.length > 0) {
            const supabaseMessages = [];
            data.forEach((item) => {
              supabaseMessages.push({
                id: item.id,
                type: 'user',
                text: item.message,
                timestamp: new Date(item.created_at).toLocaleTimeString(),
              });
              supabaseMessages.push({
                id: `${item.id}_guru`,
                type: 'guru',
                text: item.response,
                timestamp: new Date(item.created_at).toLocaleTimeString(),
              });
            });
            // Merge: Add Supabase if not in local (avoid duplicates by text + timestamp)
            const merged = [...localMessages];
            supabaseMessages.forEach((supaMsg) => {
              if (!merged.find((locMsg) => locMsg.text === supaMsg.text && locMsg.timestamp === supaMsg.timestamp)) {
                merged.push(supaMsg);
              }
            });
            // Sort by timestamp
            merged.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setMessages(merged);
            await AsyncStorage.setItem(localKey, JSON.stringify(merged));
          }
        }
      } catch (err) {
        console.error('Load history error:', err);
      }
    };
    loadHistory();
  }, [user]);

  // Save message pair to local and Supabase
  const saveMessagePair = async (userText, guruText) => {
    const timestamp = new Date().toLocaleTimeString();
    const userMsg = {
      id: `user_${Date.now()}`,
      type: 'user',
      text: userText,
      timestamp,
    };
    const guruMsg = {
      id: `guru_${Date.now()}`,
      type: 'guru',
      text: guruText,
      timestamp,
    };
    const updatedMessages = [...messages, userMsg, guruMsg];
    setMessages(updatedMessages);

    // Local save
    const localKey = `chat_${user?.id || 'guest'}`;
    await AsyncStorage.setItem(localKey, JSON.stringify(updatedMessages));

    // Supabase save (one row per pair)
    if (user) {
      const { error } = await supabase.from('chat_history').insert([{
        user_id: user.id,
        message: userText,
        response: guruText,
        created_at: new Date().toISOString(),  // Use 'created_at' for Supabase
      }]);
      if (error) {
        console.warn('Supabase save error:', error.message);
      }
    }
  };

  // Delete message (removes pair if guru, or single if user)
  const deleteMessage = async (msgId, msgType, msgText) => {
    Alert.alert(
      'Delete Message',
      `Remove this ${msgType === 'guru' ? 'chat exchange' : 'message'} from history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            let updatedMessages = [...messages];
            // Remove guru and its user pair if deleting guru
            if (msgType === 'guru') {
              const userIndex = updatedMessages.findIndex((m) => m.type === 'user' && m.timestamp === msgId.timestamp);
              if (userIndex > -1) {
                updatedMessages.splice(userIndex, 1);
              }
            }
            // Remove the message itself
            updatedMessages = updatedMessages.filter((m) => m.id !== msgId);
            setMessages(updatedMessages);

            // Local save
            const localKey = `chat_${user?.id || 'guest'}`;
            await AsyncStorage.setItem(localKey, JSON.stringify(updatedMessages));

            // Supabase delete (match by message text)
            if (user) {
              await supabase
                .from('chat_history')
                .delete()
                .eq('user_id', user.id)
                .eq('message', msgText);
            }
          },
        },
      ]
    );
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');
    setLoading(true);

    // Add user message temporarily
    const userMsg = {
      id: `user_${Date.now()}`,
      type: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const guruText = await generateHolyResponse(userText, userContext);
      await saveMessagePair(userText, guruText);
    } catch (err) {
      console.error('Generate response error:', err);
      await saveMessagePair(userText, 'ॐ Apologies, divine guidance is temporarily unavailable. Please try again. Shanti.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === 'user' ? styles.userContainer : styles.guruContainer,
      ]}
    >
      <View style={item.type === 'user' ? styles.userMessage : styles.guruMessage}>
        <Text style={item.type === 'user' ? styles.userText : styles.guruText}>
          {item.text}
        </Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      {item.type === 'guru' && (  // Delete button only on guru messages (deletes pair)
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteMessage(item, item.type, item.text)}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      )}
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
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.chatList}
          inverted  // Newest messages at bottom
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
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.disabledButton]}
            onPress={handleSend}
            disabled={loading}
          >
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
    backgroundColor: '#4a90e2',
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
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  guruContainer: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 18,
    maxWidth: '80%',
  },
  guruMessage: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 18,
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
    marginTop: 4,
    marginLeft: 8,  // Slight indent
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  sendText: {
    color: 'white',
    fontWeight: 'bold',
  },
});