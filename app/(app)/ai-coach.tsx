import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Send, Plus, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Card from '@/components/Card';
import colors from '@/constants/colors';

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export default function AICoachScreen() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('ai_chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setChats(data);
    } catch (error) {
      console.error('Error loading chats:', error);
      Alert.alert('Error', 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const handleSend = async () => {
    if (inputMessage.trim() === '' || !activeChat || sendingMessage) return;

    setSendingMessage(true);
    const userMessageContent = inputMessage;
    setInputMessage('');

    try {
      // Add user message to database
      const { data: userMessage, error: userError } = await supabase
        .from('ai_messages')
        .insert({
          chat_id: activeChat,
          content: userMessageContent,
          role: 'user',
        })
        .select()
        .single();

      if (userError) throw userError;

      // Add user message to local state
      setMessages(prev => [...prev, userMessage]);

      // Get AI response
      const aiResponse = await getAIResponse(userMessageContent);

      // Add AI message to database
      const { data: aiMessage, error: aiError } = await supabase
        .from('ai_messages')
        .insert({
          chat_id: activeChat,
          content: aiResponse,
          role: 'assistant',
        })
        .select()
        .single();

      if (aiError) throw aiError;

      // Add AI message to local state
      setMessages(prev => [...prev, aiMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const getAIResponse = async (message: string) => {
    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert basketball coach and trainer. Help users improve their basketball skills, provide training advice, explain techniques, and answer questions about basketball strategy, rules, and gameplay. Keep responses helpful, encouraging, and focused on basketball.',
            },
            {
              role: 'user',
              content: message,
            },
          ],
        }),
      });

      const data = await response.json();
      return data.completion || "I'm here to help with your basketball training! What would you like to know?";
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "Sorry, I'm having trouble responding right now. Please try again.";
    }
  };

  const createNewChat = async () => {
    if (!user?.id || newChatTitle.trim() === '') return;
    
    try {
      const { data, error } = await supabase
        .from('ai_chats')
        .insert({
          user_id: user.id,
          title: newChatTitle,
        })
        .select()
        .single();

      if (error) throw error;

      setChats(prev => [data, ...prev]);
      setActiveChat(data.id);
      setMessages([]);
      setShowNewChatModal(false);
      setNewChatTitle('');
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to create chat');
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('ai_chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (activeChat === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      Alert.alert('Error', 'Failed to delete chat');
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={[styles.chatItem, activeChat === item.id && styles.activeChatItem]}
      onPress={() => {
        setActiveChat(item.id);
        loadMessages(item.id);
      }}
    >
      <View style={styles.chatInfo}>
        <Text style={styles.chatTitle}>{item.title}</Text>
        <Text style={styles.chatTimestamp}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.role === 'user' ? styles.userMessage : styles.aiMessage]}>
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading AI Coach...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {!activeChat ? (
        <View style={styles.chatsContainer}>
          <View style={styles.chatsHeader}>
            <Text style={styles.chatsTitle}>AI Coach Conversations</Text>
            <TouchableOpacity
              style={styles.newChatButton}
              onPress={() => setShowNewChatModal(true)}
            >
              <Plus size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {chats.length > 0 ? (
            <FlatList
              data={chats}
              renderItem={renderChatItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.chatsList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubtext}>Start a new conversation with your AI basketball coach</Text>
            </View>
          )}
          
          {showNewChatModal && (
            <View style={styles.modalOverlay}>
              <Card style={styles.modalContent}>
                <Text style={styles.modalTitle}>New Conversation</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter conversation title"
                  placeholderTextColor={colors.gray[500]}
                  value={newChatTitle}
                  onChangeText={setNewChatTitle}
                  autoFocus
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setShowNewChatModal(false);
                      setNewChatTitle('');
                    }}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCreateButton}
                    onPress={createNewChat}
                  >
                    <Text style={styles.modalCreateText}>Create</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setActiveChat(null)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.chatHeaderTitle}>
              {chats.find(chat => chat.id === activeChat)?.title || 'Chat'}
            </Text>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => {
                Alert.alert(
                  'Delete Chat',
                  'Are you sure you want to delete this conversation?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteChat(activeChat) },
                  ]
                );
              }}
            >
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
          
          {messages.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
          ) : (
            <View style={styles.emptyMessagesContainer}>
              <Text style={styles.emptyMessagesText}>Start a conversation with your AI basketball coach!</Text>
              <Text style={styles.emptyMessagesSubtext}>Ask about techniques, training, strategy, or anything basketball-related.</Text>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask your basketball coach..."
              placeholderTextColor={colors.gray[500]}
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              editable={!sendingMessage}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputMessage.trim() || sendingMessage) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputMessage.trim() || sendingMessage}
            >
              <Send size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
  },
  chatsContainer: {
    flex: 1,
    padding: 16,
  },
  chatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chatsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatsList: {
    paddingBottom: 16,
  },
  chatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.secondaryLight,
    borderRadius: 12,
    marginBottom: 12,
  },
  activeChatItem: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  chatTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.secondaryDark,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalCreateButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalCreateText: {
    color: colors.text,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondaryLight,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  deleteButton: {
    padding: 8,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 16,
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyMessagesText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessagesSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: colors.secondaryLight,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: colors.text,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.secondaryLight,
  },
  input: {
    flex: 1,
    backgroundColor: colors.secondaryLight,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[700],
  },
});