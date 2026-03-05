import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { useAuthStore } from "@/utils/authStore";
import SettingsNavBar from "./SettingsNavBar";
import Toast from "react-native-toast-message";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

const getPassword = () => "****************";
const getLanguage = () => "EN-UK";

type UserResponse = {
  id: string;
  display_name?: string | null;
  email: string;
  phone?: string | null;
  default_currency?: string | null;
};

type EditableFields = {
  display_name: string;
  email: string;
  phone: string;
  default_currency: string;
};

export default function SettingsScreen() {
  const { session } = useAuthStore();
  const [data, setData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editableFields, setEditableFields] = useState<EditableFields>({
    display_name: "",
    email: "",
    phone: "",
    default_currency: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchAccount() {
      setLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        const res = await axios.get<UserResponse>(`${API_BASE_URL}/account/`, {
          headers,
        });
        if (isMounted) {
          setData(res.data);
          setEditableFields((prev) => ({
            ...prev,
            display_name: res.data.display_name || "",
            email: res.data.email || "",
            phone: res.data.phone || "",
            default_currency: res.data.default_currency || "",
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
        phone: data.phone || "",
        default_currency: data.default_currency || "",
      }));
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!session?.refresh_token) {
      Alert.alert("Error", "No valid session found. Please log in again.");
      return;
    }

    setIsSaving(true);
    try {
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await axios.patch(
        `${API_BASE_URL}/account/`,
        {
          email: editableFields.email,
          display_name: editableFields.display_name,
          phone: editableFields.phone || null,
          default_currency: editableFields.default_currency || null,
          refresh_token: session.refresh_token,
        },
        { headers },
      );

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
            <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/10 z-10 flex justify-center items-center">
              <ActivityIndicator size="large" color="#f1f1f2" />
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
            <Text className="text-gray-500 mt-1">{getPassword()}</Text>
            <Text className="text-sm text-gray-400 mt-1">
              Click here to change Password
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold">Phone</Text>
            {isEditing ? (
              <TextInput
                className="text-gray-500 mt-1"
                value={editableFields.phone}
                onChangeText={(value) => handleFieldChange("phone", value)}
                keyboardType="phone-pad"
                placeholder="z.B. +43 660 1234567"
              />
            ) : (
              <Text className="text-gray-500 mt-1">
                {data?.phone ?? "Not found"}
              </Text>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold">Default Currency</Text>
            {isEditing ? (
              <TextInput
                className="text-gray-500 mt-1"
                value={editableFields.default_currency}
                onChangeText={(value) =>
                  handleFieldChange("default_currency", value)
                }
                placeholder="z.B. EUR(€)"
              />
            ) : (
              <Text className="text-gray-500 mt-1">
                {data?.default_currency ?? "Not found"}
              </Text>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold">Language</Text>
            <Text className="text-gray-500 mt-1">{getLanguage()}</Text>
            <Text className="text-sm text-gray-400 mt-1">
              No other language available
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
