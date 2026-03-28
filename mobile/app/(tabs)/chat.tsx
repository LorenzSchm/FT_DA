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
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "@/utils/authStore";
import { getAccounts } from "@/utils/db/finance/finance";
import { chat, ConversationMessage } from "@/utils/chatbotAI";
import { getAiFlag, updateAiFlag } from "@/utils/accountApi";

interface ChatMessage {
  id: string;
  text: string;
  createdAt: Date;
  user: { _id: 1 | 2 }; // 1 = user, 2 = bot
}

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

const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";

export default function Chat() {
  const { session } = useAuthStore();

  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [loadingFlag, setLoadingFlag] = useState(true);
  const [enablingAi, setEnablingAi] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [defaultAccountId, setDefaultAccountId] = useState<
    number | undefined
  >();
  const [defaultAccountCurrency, setDefaultAccountCurrency] = useState<
    string | undefined
  >();

  const flatListRef = useRef<FlatList>(null);

  // Fetch the ai_flag on mount
  useEffect(() => {
    async function checkAiFlag() {
      if (!session?.access_token) {
        setLoadingFlag(false);
        return;
      }
      try {
        const flag = await getAiFlag(session.access_token);
        setAiEnabled(flag);
      } catch {
        setAiEnabled(false);
      } finally {
        setLoadingFlag(false);
      }
    }
    checkAiFlag();
  }, [session?.access_token]);

  useEffect(() => {
    async function loadDefaultAccount() {
      if (!session?.access_token) return;
      try {
        const data = await getAccounts(
          session.access_token,
          session.refresh_token,
        );
        const accounts = data.rows || data;
        if (accounts && accounts.length > 0) {
          setDefaultAccountId(accounts[0].id);
          setDefaultAccountCurrency(accounts[0].currency);
        }
      } catch {}
    }
    loadDefaultAccount();
  }, [session?.access_token]);

  useEffect(() => {
    if (aiEnabled && messages.length === 0) {
      setMessages([
        botMsg(
          "Hi! I'm your AI finance assistant. I can help you:\n\n" +
            '- Add transactions — "add expense 45 for groceries"\n' +
            '- View balance — "what is my balance?"\n' +
            '- List transactions — "show my recent transactions"\n' +
            '- Manage subscriptions — "show my subscriptions"\n' +
            '- Update/Delete — "delete transaction 67"\n\n' +
            "How can I help?",
        ),
      ]);
    }
  }, [aiEnabled]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleEnableAi = useCallback(async () => {
    if (!session?.access_token) return;
    setEnablingAi(true);
    try {
      await updateAiFlag(true, session.access_token, session.refresh_token);
      setAiEnabled(true);
    } catch (err: any) {
      console.error("Failed to enable AI:", err?.message);
    } finally {
      setEnablingAi(false);
    }
  }, [session?.access_token, session?.refresh_token]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !OPENAI_KEY) return;

    const uMsg = userMsg(text);
    setMessages((prev) => [...prev, uMsg]);
    setInputText("");
    scrollToEnd();
    setIsTyping(true);

    try {
      const result = await chat(
        OPENAI_KEY,
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
        botMsg(
          `Error: ${err?.message || "Something went wrong. Please try again."}`,
        ),
      ]);
    } finally {
      setIsTyping(false);
      scrollToEnd();
    }
  }, [inputText, session, defaultAccountId, conversationHistory, scrollToEnd]);

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
      <View
        style={{
          alignSelf: "flex-start",
          marginHorizontal: 16,
          marginVertical: 4,
        }}
      >
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
          <Text style={{ color: "#888", fontSize: 14, marginLeft: 6 }}>
            Thinking...
          </Text>
        </View>
      </View>
    );
  };

  // ─── Loading state ──────────────────────────────────────────────────
  if (loadingFlag) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  // ─── AI consent screen ─────────────────────────────────────────────
  if (!aiEnabled) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#000",
              marginBottom: 12,
            }}
          >
            AI Assistant
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: "#666",
              lineHeight: 22,
              marginBottom: 24,
            }}
          >
            This feature uses an AI model (OpenAI) to help you manage your
            finances through natural language. Before enabling, please be aware
            of the following:
          </Text>

          <View
            style={{
              backgroundColor: "#FEF3C7",
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#92400E",
                marginBottom: 10,
              }}
            >
              Important Information
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: "#78350F",
                lineHeight: 21,
                marginBottom: 8,
              }}
            >
              {"\u2022"} Your messages and financial context (account balances,
              transactions) are sent to OpenAI's servers for processing.
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#78350F",
                lineHeight: 21,
                marginBottom: 8,
              }}
            >
              {"\u2022"} AI responses may occasionally be inaccurate or
              incomplete. Always verify important financial information.
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#78350F",
                lineHeight: 21,
                marginBottom: 8,
              }}
            >
              {"\u2022"} The assistant can create, modify, and delete
              transactions on your behalf based on your instructions.
            </Text>
            <Text style={{ fontSize: 14, color: "#78350F", lineHeight: 21 }}>
              {"\u2022"} This feature is not a substitute for professional
              financial advice.
            </Text>
          </View>

          <Text
            style={{
              fontSize: 13,
              color: "#999",
              lineHeight: 19,
              marginBottom: 24,
            }}
          >
            By enabling the AI assistant, you acknowledge these risks and
            consent to your data being processed by a third-party AI service.
            You can disable this at any time in your settings.
          </Text>

          <TouchableOpacity
            onPress={handleEnableAi}
            activeOpacity={0.8}
            disabled={enablingAi}
            style={{
              backgroundColor: enablingAi ? "#999" : "#000",
              borderRadius: 9999,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {enablingAi && (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              {enablingAi ? "Enabling..." : "Enable AI Assistant"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Chat UI ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 14,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#000" }}>
            Assistant
          </Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListFooterComponent={renderTypingIndicator}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
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
