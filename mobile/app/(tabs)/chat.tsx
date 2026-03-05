import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "@/utils/authStore";
import { getAccounts } from "@/utils/db/finance/finance";
import { chat, ConversationMessage } from "@/utils/chatbotAI";

// ─── Types ───────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  text: string;
  createdAt: Date;
  user: { _id: 1 | 2 }; // 1 = user, 2 = bot
}

// ─── Helpers ─────────────────────────────────────────────────────────

let messageIdCounter = 0;
function makeId(): string {
  return `msg_${Date.now()}_${messageIdCounter++}`;
}

function botMsg(text: string): ChatMessage {
  return { id: makeId(), text, createdAt: new Date(), user: { _id: 2 } };
}

function userMsg(text: string): ChatMessage {
  return { id: makeId(), text, createdAt: new Date(), user: { _id: 1 } };
}

// ─── Component ───────────────────────────────────────────────────────

const OPENAI_KEY_FROM_ENV = process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";

export default function Chat() {
  const { session } = useAuthStore();

  // API key state — pre-filled from .env if available
  const [apiKey, setApiKey] = useState(OPENAI_KEY_FROM_ENV);
  const [apiKeyConfirmed, setApiKeyConfirmed] = useState(!!OPENAI_KEY_FROM_ENV);
  const [apiKeyInput, setApiKeyInput] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [defaultAccountId, setDefaultAccountId] = useState<number | undefined>();
  const [defaultAccountCurrency, setDefaultAccountCurrency] = useState<string | undefined>();

  const flatListRef = useRef<FlatList>(null);

  // Load first account on mount
  useEffect(() => {
    async function loadDefaultAccount() {
      if (!session?.access_token) return;
      try {
        const data = await getAccounts(session.access_token, session.refresh_token);
        const accounts = data.rows || data;
        if (accounts && accounts.length > 0) {
          setDefaultAccountId(accounts[0].id);
          setDefaultAccountCurrency(accounts[0].currency);
        }
      } catch {
        // Silently fail
      }
    }
    loadDefaultAccount();
  }, [session?.access_token]);

  // Show welcome message once API key is confirmed
  useEffect(() => {
    if (apiKeyConfirmed && messages.length === 0) {
      setMessages([
        botMsg(
          "Hi! I'm your AI finance assistant. I can help you:\n\n" +
          "• Add transactions — \"add expense 45 for groceries\"\n" +
          "• View balance — \"what is my balance?\"\n" +
          "• List transactions — \"show my recent transactions\"\n" +
          "• Manage subscriptions — \"show my subscriptions\"\n" +
          "• Update/Delete — \"delete transaction 67\"\n\n" +
          "How can I help?"
        ),
      ]);
    }
  }, [apiKeyConfirmed]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleConfirmApiKey = useCallback(() => {
    const key = apiKeyInput.trim();
    if (!key || !key.startsWith("sk-")) return;
    setApiKey(key);
    setApiKeyConfirmed(true);
  }, [apiKeyInput]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !apiKey) return;

    const uMsg = userMsg(text);
    setMessages((prev) => [...prev, uMsg]);
    setInputText("");
    scrollToEnd();
    setIsTyping(true);

    try {
      const result = await chat(
        apiKey,
        conversationHistory,
        text,
        session as any,
        defaultAccountId,
        defaultAccountCurrency,
      );

      setConversationHistory(result.history);
      setMessages((prev) => [...prev, botMsg(result.reply)]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        botMsg(`⚠️ Error: ${err?.message || "Something went wrong. Please try again."}`),
      ]);
    } finally {
      setIsTyping(false);
      scrollToEnd();
    }
  }, [inputText, apiKey, session, defaultAccountId, conversationHistory, scrollToEnd]);

  // ─── Render ──────────────────────────────────────────────────────

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.user._id === 1;
    return (
      <View
        style={{
          alignSelf: isUser ? "flex-end" : "flex-start",
          maxWidth: "80%",
          marginVertical: 4,
          marginHorizontal: 16,
        }}
      >
        <View
          style={{
            backgroundColor: isUser ? "#000" : "#F1F1F2",
            borderRadius: 18,
            borderBottomRightRadius: isUser ? 4 : 18,
            borderBottomLeftRadius: isUser ? 18 : 4,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Text
            style={{
              color: isUser ? "#fff" : "#000",
              fontSize: 15,
              lineHeight: 21,
            }}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  }, []);

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    return (
      <View style={{ alignSelf: "flex-start", marginHorizontal: 16, marginVertical: 4 }}>
        <View
          style={{
            backgroundColor: "#F1F1F2",
            borderRadius: 18,
            borderBottomLeftRadius: 4,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <ActivityIndicator size="small" color="#888" />
          <Text style={{ color: "#888", fontSize: 14, marginLeft: 6 }}>Thinking...</Text>
        </View>
      </View>
    );
  };

  // ─── API Key entry screen ────────────────────────────────────────
  if (!apiKeyConfirmed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#000", marginBottom: 8 }}>
            AI Assistant
          </Text>
          <Text style={{ fontSize: 15, color: "#666", marginBottom: 24, lineHeight: 22 }}>
            Enter your OpenAI API key to enable the AI-powered chatbot. Your key is stored locally and never sent to our servers.
          </Text>
          <TextInput
            style={{
              backgroundColor: "#F1F1F2",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 15,
              color: "#000",
              marginBottom: 16,
            }}
            placeholder="sk-..."
            placeholderTextColor="#999"
            value={apiKeyInput}
            onChangeText={setApiKeyInput}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <TouchableOpacity
            onPress={handleConfirmApiKey}
            activeOpacity={0.8}
            style={{
              backgroundColor: apiKeyInput.trim().startsWith("sk-") ? "#000" : "#ccc",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
            }}
            disabled={!apiKeyInput.trim().startsWith("sk-")}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Connect
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main chat screen ────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: "#F1F1F2",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#000" }}>
            Assistant
          </Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={renderTypingIndicator}
        />

        {/* Input bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: "#F1F1F2",
            backgroundColor: "#fff",
          }}
        >
          <TextInput
            style={{
              flex: 1,
              backgroundColor: "#F1F1F2",
              borderRadius: 24,
              paddingHorizontal: 18,
              paddingVertical: 12,
              fontSize: 15,
              color: "#000",
              maxHeight: 100,
            }}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            activeOpacity={0.7}
            style={{
              marginLeft: 10,
              backgroundColor: inputText.trim() ? "#000" : "#ccc",
              width: 44,
              height: 44,
              borderRadius: 22,
              justifyContent: "center",
              alignItems: "center",
            }}
            disabled={!inputText.trim() || isTyping}
          >
            <Feather name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
