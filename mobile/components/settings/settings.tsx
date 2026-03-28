import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useAuthStore } from "@/utils/authStore";
import {
  getAccount,
  updateAccount,
  changePassword,
  confirmResetPassword,
  getAiFlag,
  updateAiFlag,
  UserResponse,
} from "@/utils/accountApi";
import SettingsNavBar from "./SettingsNavBar";
import Toast from "react-native-toast-message";
import { LogOut, Eye, EyeOff, ChevronRight } from "lucide-react-native";
import CustomPicker from "@/components/ui/CustomPicker";
import { useRouter } from "expo-router";
import { Skeleton } from "@/components/ui/skeleton";
import LegalModal from "@/components/modals/LegalModal";

const getDefaultCurrency = () => "EUR";
const getLanguage = () => "EN-UK";

const CURRENCY_OPTIONS = [
  { value: "EUR", label: "EUR (€)" },
  { value: "USD", label: "USD ($)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CHF", label: "CHF" },
];

type EditableFields = {
  display_name: string;
  email: string;
  phone: string;
  defaultCurrency: string;
  language: string;
};

export default function SettingsScreen() {
  const { session, signOut } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResettingPassword, setIsResettingPassword] = useState<boolean>(false);
  const [resetStep, setResetStep] = useState<"idle" | "otp">("idle");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [editableFields, setEditableFields] = useState<EditableFields>({
    display_name: "",
    email: "",
    phone: "",
    defaultCurrency: getDefaultCurrency(),
    language: getLanguage(),
  });
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiToggling, setAiToggling] = useState(false);
  const [legalModalType, setLegalModalType] = useState<"privacy" | "terms" | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAccount() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAccount(session?.access_token);
        if (isMounted) {
          setData(res.data);
          setEditableFields((prev) => ({
            ...prev,
            display_name: res.data.display_name || "",
            email: res.data.email || "",
            defaultCurrency: res.data.currency || getDefaultCurrency(),
          }));
        }
        try {
          const flag = await getAiFlag(session?.access_token);
          if (isMounted) setAiEnabled(flag);
        } catch {
          // ai_flag fetch failure is non-critical
        }
      } catch (err: any) {
        console.error("Failed to load account:", err);
        if (isMounted)
          setError(
            err?.response?.data?.detail ||
            err.message ||
            "Failed to load settings",
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAccount();
    return () => {
      isMounted = false;
    };
  }, [session?.access_token]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    if (data) {
      setEditableFields((prev) => ({
        ...prev,
        display_name: data.display_name || "",
        email: data.email || "",
        defaultCurrency: data.currency || getDefaultCurrency(),
      }));
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!session?.refresh_token || !session?.access_token) {
      Alert.alert("Error", "No valid session found. Please log in again.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateAccount({
        email: editableFields.email,
        display_name: editableFields.display_name,
        currency: editableFields.defaultCurrency,
        refresh_token: session.refresh_token,
        access_token: session.access_token,
      });

      setData(response.data);
      setIsEditing(false);
      Toast.show({
        type: "success",
        text1: "Settings updated successfully",
      });
    } catch (err: any) {
      console.error("Failed to update account:", err);
      Toast.show({
        type: "error",
        text1: "Failed to update settings",
        text2: err?.response?.data?.detail || err.message || "Unknown error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof EditableFields, value: string) => {
    setEditableFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSendResetEmail = async () => {
    if (!session?.access_token || !session?.refresh_token) return;
    setIsResettingPassword(true);
    try {
      await changePassword({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      setResetStep("otp");
      Toast.show({
        type: "success",
        text1: "Reset code sent",
        text2: "Check your email for the OTP code",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to send reset email",
        text2: err?.response?.data?.detail || err.message || "Unknown error",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      Toast.show({
        type: "error",
        text1: "Please enter both the OTP and a new password",
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password must be at least 6 characters",
      });
      return;
    }

    setIsConfirming(true);
    try {
      await confirmResetPassword({
        email: data?.email || editableFields.email,
        otp: otp.trim(),
        new_password: newPassword,
      });
      Toast.show({
        type: "success",
        text1: "Password updated successfully",
      });
      setResetStep("idle");
      setOtp("");
      setNewPassword("");
      setShowNewPassword(false);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to reset password",
        text2: err?.response?.data?.detail || err.message || "Unknown error",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleAiToggle = async (value: boolean) => {
    if (!session?.access_token) return;
    setAiToggling(true);
    try {
      const result = await updateAiFlag(value, session.access_token, session.refresh_token);
      setAiEnabled(result);
      Toast.show({
        type: "success",
        text1: value ? "AI Assistant enabled" : "AI Assistant disabled",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to update AI setting",
        text2: err?.response?.data?.detail || err.message || "Unknown error",
      });
    } finally {
      setAiToggling(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <SettingsNavBar isEditing={false} onEditToggle={() => { }} />
        <ScrollView>
          <View className="p-6 mt-4">
            {["Name", "Email", "Password", "Default Currency", "Language"].map(
              (label) => (
                <View key={label} className="mb-6">
                  <Skeleton mode="light" className="h-6 w-28 mb-2 rounded" animated />
                  <Skeleton mode="light" className="h-4 w-48 rounded" animated />
                </View>
              ),
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white">
        <SettingsNavBar isEditing={false} onEditToggle={() => { }} />
        <ScrollView>
          <View className="p-6 mt-4">
            <Text className="text-lg font-bold text-red-600">Error</Text>
            <Text className="text-gray-500 mt-1">{error}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  const logOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-white">
      <SettingsNavBar
        isEditing={isEditing}
        onEditToggle={handleEditToggle}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      <ScrollView>
        <View className="p-6 mt-4">
          {isSaving && (
            <View className="absolute top-0 left-0 right-0 bottom-0 z-10 flex justify-center items-center">
              <ActivityIndicator size="large" color="#000" />
            </View>
          )}

          <View className="mb-6">
            <Text className="text-lg font-bold">Name</Text>
            {isEditing ? (
              <TextInput
                className="text-gray-500 mt-1"
                value={editableFields.display_name}
                onChangeText={(value) =>
                  handleFieldChange("display_name", value)
                }
              />
            ) : (
              <Text className="text-gray-500 mt-1">
                {data?.display_name ?? "Not set"}
              </Text>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold">Email</Text>
            {isEditing ? (
              <TextInput
                className="text-gray-500 mt-1"
                value={editableFields.email}
                onChangeText={(value) => handleFieldChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text className="text-gray-500 mt-1">
                {data?.email ?? "Not set"}
              </Text>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold">Password</Text>

            {resetStep === "idle" ? (
              <TouchableOpacity
                className={`mt-1 bg-gray-100 rounded-full py-3 px-3 self-start ${isResettingPassword ? "opacity-60" : ""}`}
                disabled={isResettingPassword}
                onPress={handleSendResetEmail}
              >
                <Text className="text-black font-semibold text-sm">
                  {isResettingPassword ? "Sending..." : "Reset Password"}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="mt-3">
                <Text className="text-sm text-gray-500 mb-3">
                  Enter the code from your email and your new password.
                </Text>

                <TextInput
                  className="bg-neutral-100 rounded-full px-5 py-3 text-black text-base mb-3"
                  placeholder="OTP Code"
                  placeholderTextColor="#9FA1A4"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                />

                <View className="bg-neutral-100 rounded-full px-5 py-3 mb-3 flex-row items-center">
                  <TextInput
                    className="text-black text-base flex-1"
                    placeholder="New Password"
                    placeholderTextColor="#9FA1A4"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff size={20} color="#9FA1A4" />
                    ) : (
                      <Eye size={20} color="#9FA1A4" />
                    )}
                  </TouchableOpacity>
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className={`bg-black rounded-full py-3 px-5 ${isConfirming ? "opacity-60" : ""}`}
                    disabled={isConfirming}
                    onPress={handleConfirmReset}
                  >
                    <Text className="text-white font-semibold text-sm">
                      {isConfirming ? "Confirming..." : "Confirm"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-neutral-200 rounded-full py-3 px-5"
                    onPress={() => {
                      setResetStep("idle");
                      setOtp("");
                      setNewPassword("");
                      setShowNewPassword(false);
                    }}
                  >
                    <Text className="text-black font-semibold text-sm">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold">Default Currency</Text>
            {isEditing ? (
              <CustomPicker
                placeholder="Select currency"
                value={editableFields.defaultCurrency}
                onValueChange={(value) =>
                  handleFieldChange("defaultCurrency", value)
                }
                options={CURRENCY_OPTIONS}
                variant="settings"
                className="mt-1"
              />
            ) : (
              <Text className="text-gray-500 mt-1">
                {CURRENCY_OPTIONS.find((o) => o.value === editableFields.defaultCurrency)?.label ?? editableFields.defaultCurrency}
              </Text>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold">Language</Text>
            {isEditing ? (
              <TextInput
                className="text-gray-500 mt-1"
                value={editableFields.language}
                onChangeText={(value) => handleFieldChange("language", value)}
              />
            ) : (
              <Text className="text-gray-500 mt-1">
                {editableFields.language}
              </Text>
            )}
          </View>
          {/* AI Assistant toggle */}
          <View className="mb-6">
            <Text className="text-lg font-bold mb-1">AI Assistant</Text>
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-gray-500 flex-1 mr-4">
                Enable the AI chatbot to manage finances via natural language.
                Your data is sent to OpenAI for processing.
              </Text>
              <Switch
                value={aiEnabled}
                onValueChange={handleAiToggle}
                disabled={aiToggling}
                trackColor={{ false: "#d1d5db", true: "#000" }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Legal links */}
          <View className="mb-6">
            <Text className="text-lg font-bold mb-2">Legal</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between py-3"
              onPress={() => setLegalModalType("privacy")}
            >
              <Text className="text-gray-500 text-base">Privacy Policy</Text>
              <ChevronRight size={18} color="#9ca3af" />
            </TouchableOpacity>
            <View className="border-b border-gray-100" />
            <TouchableOpacity
              className="flex-row items-center justify-between py-3"
              onPress={() => setLegalModalType("terms")}
            >
              <Text className="text-gray-500 text-base">Terms of Service</Text>
              <ChevronRight size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View className="flex flex-col gap-2 ">
            <TouchableOpacity onPress={() => logOut()}>
              <LogOut className="text-red-600" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <LegalModal
        isVisible={legalModalType !== null}
        onClose={() => setLegalModalType(null)}
        type={legalModalType || "privacy"}
      />
    </View>
  );
}
