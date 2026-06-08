import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: '0',
      sender: 'ai',
      text: 'Merhaba! Ben FocusFlow AI Kocun. Bugun odaklanma performansini nasil artirabiriz?',
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!prompt.trim() || loading) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const { data } = await apiClient.post('/ai/chat', { prompt: userMsg.text });
      const aiText = data?.reply || 'Bir sorun olustu, tekrar dener misin?';
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'ai', text: aiText },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'ai', text: 'Baglanti hatasi. Lutfen tekrar dene.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAi]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color="#818cf8" />
          </View>
        )}
        <View style={[styles.msgBubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
          <Text style={[styles.msgText, isUser && { color: '#fff' }]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0a0f1a', '#111620', '#0a0f1a']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#818cf8" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Verimlilik Kocu</Text>
            <Text style={styles.headerSub}>Gemini ile guclendirildi</Text>
          </View>
        </View>
        <View style={[styles.statusDot, loading && { backgroundColor: '#f59e0b' }]} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.msgList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          loading ? (
            <View style={[styles.msgRow, styles.msgRowAi]}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={16} color="#818cf8" />
              </View>
              <View style={[styles.msgBubble, styles.bubbleAi]}>
                <ActivityIndicator size="small" color="#818cf8" />
                <Text style={[styles.msgText, { marginLeft: 8 }]}>Dusunuyor...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Kocuna bir sey sor..."
            placeholderTextColor="#475569"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            maxLength={500}
            editable={!loading}
          />
          <Pressable
            onPress={sendMessage}
            disabled={loading || !prompt.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              (!prompt.trim() || loading) && { opacity: 0.4 },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: '700' },
  headerSub: { color: '#64748b', fontSize: 11, marginTop: 1 },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
  },
  msgList: { paddingHorizontal: 16, paddingVertical: 12 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAi: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  msgBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bubbleUser: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  msgText: { color: '#e2e8f0', fontSize: 14, lineHeight: 20, flexShrink: 1 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(10,15,26,0.9)',
  },
  input: {
    flex: 1,
    backgroundColor: '#111620',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#f1f5f9',
    fontSize: 14,
    maxHeight: 100,
    marginRight: 10,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
