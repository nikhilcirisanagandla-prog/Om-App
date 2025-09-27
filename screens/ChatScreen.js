import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../components/AuthContext';
import { generateHolyResponse } from '../utils/generateHolyResponse';  // Holy response utility
// import { supabase } from '../utils/supabase';  // Uncomment for chat history sync

export default function ChatScreen({ streak }) {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);  // Local chat history
  const [isLoading, setIsLoading] = useState(false);
  const { profile, user } = useAuth();
  const userContext = { streak, profile };

  // Optional: Load chat history from Supabase on mount (uncomment)
  // useEffect(() => {
  //   if (user) {
  //     const fetchHistory = async () => {
  //       const { data } = await supabase
  //         .from('chat_history')
  //         .select('*')
  //         .eq('user_id', user.id)
  //         .order('timestamp', { ascending: true });
  //       if (data) {
  //         setResponses(data.map(item => ({
  //           user: item.message,
  //           guru: item.response,
  //           timestamp: new Date(item.timestamp).toLocaleTimeString()
  //         })));
  //       }
  //     };
  //     fetchHistory();
  //   }
  // }, [user]);

  const handleSend = () => {
    if (!message.trim()) return;

    const userMsg = message.trim();
    setIsLoading(true);

    // Add user message immediately
    setResponses(prev => [...prev, { 
      user: userMsg, 
      timestamp: new Date().toLocaleTimeString() 
    }]);

    // Generate holy response (simulated; personalized for Hinduism/Ramayan)
    const holyReply = generateHolyResponse(userMsg, userContext);

    // Simulate divine delay
    setTimeout(() => {
      setResponses(prev => [...prev, { 
        guru: holyReply.text, 
        source: holyReply.source, 
        timestamp: new Date(holyReply.timestamp).toLocaleTimeString() 
      }]);
      
      // Optional: Save to Supabase (uncomment)
      // if (user) {
      //   supabase.from('chat_history').insert({
      //     user_id: user.id,
      //     message: userMsg,
      //     response: holyReply.text
      //   }).catch(console.error);
      // }

      Alert.alert('Guru Speaks ॐ', 'Holy wisdom received. Reflect and apply to your faith.');
      setIsLoading(false);
    }, 1000);

    setMessage('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Holy Guidance (Streak: {streak})</Text>
      <Text style={styles.subtitle}>
        Ask about dharma, Rama, festivals, puja, or your deity. Speak with reverence.
      </Text>
      <ScrollView 
        style={styles.chat} 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {responses.length === 0 ? (
          <Text style={styles.empty}>Begin your query to the Divine... e.g., "Guide me on Ramayan" or "How to perform aarti?"</Text>
        ) : (
          responses.map((r, i) => (
            <View key={i} style={styles.message}>
              {r.user && (
                <View style={styles.userBubble}>
                  <Text style={styles.userMsg}>You ({r.timestamp}): {r.user}</Text>
                </View>
              )}
              {r.guru && (
                <View style={styles.guruBubble}>
                  <Text style={styles.guruHeader}>Guru:</Text>
                  <Text style={styles.guruText}>{r.guru}</Text>
                  <Text style={styles.source}>- {r.source} ({r.timestamp})</Text>
                </View>
              )}
            </View>
          ))
        )}
        {isLoading && <Text style={styles.loading}>The Divine contemplates... ॐ</Text>}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your sacred question..."
          value={message}
          onChangeText={setMessage}
          multiline
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.disabledButton]} 
          onPress={handleSend} 
          disabled={isLoading || !message.trim()}
        >
          <Text style={styles.buttonText}>Invoke Wisdom</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#87CEEB'  // Sky blue
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#FFD700',  // Gold
    textAlign: 'center', 
    marginVertical: 10,
    paddingTop: 10
  },
  subtitle: { 
    fontSize: 14, 
    color: '#FFFFFF', 
    textAlign: 'center', 
    marginHorizontal: 20,
    marginBottom: 10,
    fontStyle: 'italic'
  },
  chat: { 
    flex: 1, 
    marginHorizontal: 10,
    marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  empty: { 
    fontSize: 16, 
    color: '#FFFFFF', 
    textAlign: 'center', 
    marginTop: 50,
    fontStyle: 'italic'
  },
  message: { 
    marginVertical: 5 
  },
  userBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: 'white', 
    padding: 10, 
    borderRadius: 8,
    maxWidth: '80%'
  },
  userMsg: { 
    fontWeight: 'bold', 
    color: '#FFD700'  // Gold user text
  },
  guruBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: 'rgba(255,215,0,0.1)',  // Light gold
    padding: 15, 
    borderRadius: 8, 
    borderLeftWidth: 4, 
    borderLeftColor: '#FFD700',
    maxWidth: '80%'
  },
  guruHeader: { 
    fontWeight: 'bold', 
    color: '#FFD700',  // Gold header
    fontSize: 16,
    marginBottom: 5
  },
  guruText: { 
    fontStyle: 'italic', 
    color: '#4A148C',  // Deep purple for wisdom
    lineHeight: 20,
    marginBottom: 5
  },
  source: { 
    fontSize: 12, 
    color: '#795548', 
    fontStyle: 'italic', 
    alignSelf: 'flex-end',
    marginTop: 5
  },
  loading: { 
    fontSize: 14, 
    color: '#FFFFFF', 
    textAlign: 'center', 
    fontStyle: 'italic',
    marginVertical: 10
  },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 10,
    backgroundColor: '#87CEEB'
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#FFD700', 
    padding: 15, 
    borderRadius: 8, 
    backgroundColor: 'white', 
    minHeight: 50,
    marginRight: 10
  },
  button: { 
    backgroundColor: '#FFD700',  // Gold
    padding: 15, 
    borderRadius: 8, 
    justifyContent: 'center',
    minWidth: 100
  },
  disabledButton: { 
    opacity: 0.7 
  },
  buttonText: { 
    color: '#87CEEB',  // Sky blue
    fontWeight: 'bold', 
    textAlign: 'center'
  },
});