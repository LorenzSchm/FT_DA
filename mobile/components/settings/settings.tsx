import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useAuthStore } from "@/utils/authStore";
import {
  getAccount,
  updateAccount,
  changePassword,
  UserResponse,
} from "@/utils/accountApi";
import SettingsNavBar from "./SettingsNavBar";
import Toast from "react-native-toast-message";
import { LogOut, Eye, EyeOff } from "lucide-react-native";
import CustomPicker from "@/components/ui/CustomPicker";
import { useRouter } from "expo-router";

const getDefaultCurrency = () => "EUR(€)";
const getLanguage = () => "EN-UK";

const CURRENCY_OPTIONS = [
  { value: "EUR(€)", label: "EUR (€)" },
  { value: "USD($)", label: "USD ($)" },
  { value: "GBP(£)", label: "GBP (£)" },
  { value: "CHF(CHF)", label: "CHF" },
];

type EditableFields = {
  display_name: string;
  email: string;
  password: string;
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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [editableFields, setEditableFields] = useState<EditableFields>({
    display_name: "",
    email: "",
    password: "",
    phone: "",
    defaultCurrency: getDefaultCurrency(),
    language: getLanguage(),
  });

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
          }));
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
        password: "",
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
        refresh_token: session.refresh_token,
        access_token: session.access_token,
      });

      setData(response.data);

      if (editableFields.password.trim().length > 0) {
        try {
          await changePassword({
            password: editableFields.password,
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
          Toast.show({
            type: "success",
            text1: "Password changed successfully",
          });
        } catch (pwErr: any) {
          console.error("Failed to change password:", pwErr);
          Toast.show({
            type: "error",
            text1: "Failed to change password",
            text2:
              pwErr?.response?.data?.detail || pwErr.message || "Unknown error",
          });
        }
      }

      setEditableFields((prev) => ({ ...prev, password: "" }));
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

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <SettingsNavBar isEditing={false} onEditToggle={() => {}} />
        <ScrollView>
          <View className="p-6 mt-4">
            <Text className="text-lg">Loading settings…</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white">
        <SettingsNavBar isEditing={false} onEditToggle={() => {}} />
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
            {isEditing ? (
              <View className="flex-row items-center mt-1">
                <TextInput
                  className="text-gray-500 flex-1"
                  value={editableFields.password}
                  onChangeText={(value) => handleFieldChange("password", value)}
                  secureTextEntry={!showPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#9FA1A4"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9FA1A4" />
                  ) : (
                    <Eye size={20} color="#9FA1A4" />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <Text className="text-gray-500 mt-1">****************</Text>
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
                {editableFields.defaultCurrency}
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
          <View className="flex flex-col gap-2 ">
            <TouchableOpacity onPress={() => logOut()}>
              <LogOut className="text-red-600" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
