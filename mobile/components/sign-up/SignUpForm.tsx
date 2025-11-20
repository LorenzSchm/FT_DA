import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import CustomPicker from "@/components/ui/CustomPicker";
import { useAuthStore } from "@/utils/authStore";
import Toast from "react-native-toast-message";

type Props = {
  isVisible: boolean;
  email: string;
};

enum STATE {
  FIRST = "FIRST",
  SECOND = "SECOND",
}

type Errors = {
  email?: string;
  password?: string;
  repeatPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export default function SignUpForm({ isVisible, email }: Props) {
  const [state, setState] = useState<STATE>(STATE.FIRST);
  const [password, setPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");
  const [mail, setMail] = useState<string>(email);
  const [phone, setPhone] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [currency, setCurrency] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const [open, setOpen] = useState<boolean>(false);
  const [currencies, setCurrencies] = useState<any[]>([
    { label: "USD", value: "USD" },
    { label: "EUR", value: "EUR" },
    { label: "GBP", value: "GBP" },
    { label: "CHF", value: "CHF" },
  ]);

  const { signUp } = useAuthStore();

  useEffect(() => {
    setMail(email);
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
  }, [email]);

  const validateEmail = (email: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password))
      return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    return undefined;
  };

  const validateRepeatPassword = (
    password: string,
    repeat: string,
  ): string | undefined => {
    if (!repeat) return "Please repeat your password";
    if (password !== repeat) return "Passwords do not match";
    return undefined;
  };

  const validateFirstName = (name: string): string | undefined => {
    if (!name) return "First name is required";
    return undefined;
  };

  const validateLastName = (name: string): string | undefined => {
    if (!name) return "Last name is required";
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone)) return "Invalid phone number format";
    return undefined;
  };

  const validateFirstStep = (): boolean => {
    const newErrors: Errors = {
      email: validateEmail(mail),
      password: validatePassword(password),
      repeatPassword: validateRepeatPassword(password, repeatPassword),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const validateSecondStep = (): boolean => {
    const newErrors: Errors = {
      firstName: validateFirstName(firstName),
      lastName: validateLastName(lastName),
      phone: validatePhone(phone),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleContinue = () => {
    if (validateFirstStep()) {
      setState(STATE.SECOND);
    }
  };

  const handleSubmit = async () => {
    if (validateSecondStep()) {
      await signUp(email, password, firstName + " " + lastName)
        .then(() => {
          console.log("User signed up successfully");
          Toast.show({
            type: "success",
            text1: "User signed up successfully",
            visibilityTime: 3000,
          });
        })
        .catch((error) => {
          console.error("Error signing up:", error);
        });
    }
  };

  return isVisible ? (
    <View className="flex flex-col gap-[20px]">
      {state === STATE.FIRST ? (
        <View className="flex flex-col gap-[20px]">
          <View>
            <TextInput
              className={`text-black text-[20px] border rounded-full h-[50px] px-4 mt-[60px] ${
                errors.email ? "border-red-500" : "border-black"
              }`}
              placeholder="Enter your email"
              value={mail}
              onChangeText={(text) => {
                setMail(text);
                setErrors((prev) => ({ ...prev, email: validateEmail(text) }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text className="text-red-500 text-[14px] mt-1">
                {errors.email}
              </Text>
            )}
          </View>

          <View>
            <TextInput
              className={`text-black text-[20px] border rounded-full h-[50px] px-4 ${
                errors.password ? "border-red-500" : "border-black"
              }`}
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({
                  ...prev,
                  password: validatePassword(text),
                  repeatPassword: validateRepeatPassword(text, repeatPassword),
                }));
              }}
              secureTextEntry
              textContentType="oneTimeCode"
            />
            {errors.password && (
              <Text className="text-red-500 text-[14px] mt-1">
                {errors.password}
              </Text>
            )}
          </View>

          <View>
            <TextInput
              className={`text-black text-[20px] border rounded-full h-[50px] px-4 ${
                errors.repeatPassword ? "border-red-500" : "border-black"
              }`}
              placeholder="Repeat your password"
              value={repeatPassword}
              onChangeText={(text) => {
                setRepeatPassword(text);
                setErrors((prev) => ({
                  ...prev,
                  repeatPassword: validateRepeatPassword(password, text),
                }));
              }}
              secureTextEntry
              textContentType="oneTimeCode"
            />
            {errors.repeatPassword && (
              <Text className="text-red-500 text-[14px] mt-1">
                {errors.repeatPassword}
              </Text>
            )}
          </View>

          <View className="flex flex-row items-center justify-center gap-2">
            <View className="bg-black h-[7px] w-[7px] rounded-full" />
            <TouchableOpacity
              onPress={handleContinue}
              className="bg-gray-400 h-[7px] w-[7px] rounded-full"
            />
          </View>

          <TouchableOpacity
            className="bg-black shadow-md rounded-full h-[50px] flex items-center justify-center"
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text className="text-white font-bold text-[15px]">Continue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex flex-col gap-[20px]">
          <View>
            <TextInput
              className={`text-black text-[20px] border rounded-full h-[50px] px-4 mt-[60px] ${
                errors.firstName ? "border-red-500" : "border-black"
              }`}
              placeholder="First name"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                setErrors((prev) => ({
                  ...prev,
                  firstName: validateFirstName(text),
                }));
              }}
            />
            {errors.firstName && (
              <Text className="text-red-500 text-[14px] mt-1">
                {errors.firstName}
              </Text>
            )}
          </View>

          <View>
            <TextInput
              className={`text-black text-[20px] border rounded-full h-[50px] px-4 ${
                errors.lastName ? "border-red-500" : "border-black"
              }`}
              placeholder="Last name"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                setErrors((prev) => ({
                  ...prev,
                  lastName: validateLastName(text),
                }));
              }}
            />
            {errors.lastName && (
              <Text className="text-red-500 text-[14px] mt-1">
                {errors.lastName}
              </Text>
            )}
          </View>

          <View>
            <TextInput
              className={`text-black text-[20px] border rounded-full h-[50px] px-4 ${
                errors.phone ? "border-red-500" : "border-black"
              }`}
              placeholder="Phone number"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setErrors((prev) => ({ ...prev, phone: validatePhone(text) }));
              }}
              keyboardType="phone-pad"
            />
            {errors.phone && (
              <Text className="text-red-500 text-[14px] mt-1">
                {errors.phone}
              </Text>
            )}
          </View>

          <CustomPicker
            placeholder={"Select your default currency"}
            value={currency}
            onValueChange={(value) => {
              setCurrency(value);
            }}
            options={currencies}
          />

          <View className="flex flex-row items-center justify-center gap-2">
            <TouchableOpacity
              onPress={() => setState(STATE.FIRST)}
              className="bg-gray-400 h-[7px] w-[7px] rounded-full"
            />
            <View className="bg-black h-[7px] w-[7px] rounded-full" />
          </View>

          <TouchableOpacity
            className="bg-black shadow-md rounded-full h-[50px] flex items-center justify-center"
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text className="text-white font-bold text-[15px]">Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ) : null;
}
