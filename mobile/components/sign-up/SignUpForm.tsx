import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import CustomPicker from "@/components/ui/CustomPicker";
import { useAuthStore } from "@/utils/authStore";
import { Eye, EyeOff } from "lucide-react-native";

type Props = {
  isVisible: boolean;
  email: string;
};

enum STATE {
  FIRST = "FIRST",
  SECOND = "SECOND",
  CONFIRMATION = "CONFIRMATION",
}

type Errors = {
  email?: string;
  password?: string;
  repeatPassword?: string;
  firstName?: string;
  lastName?: string;
};

export default function SignUpForm({ isVisible, email }: Props) {
  const [state, setState] = useState<STATE>(STATE.FIRST);
  const [password, setPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");
  const [mail, setMail] = useState<string>(email);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [currency, setCurrency] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const [currencies, setCurrencies] = useState<any[]>([
    { label: "USD", value: "USD" },
    { label: "EUR", value: "EUR" },
    { label: "GBP", value: "GBP" },
    { label: "CHF", value: "CHF" },
  ]);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { signUp } = useAuthStore();

  useEffect(() => {
    setMail(email);
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
  }, [email]);

  useEffect(() => {
    if (!isVisible) {
      setState(STATE.FIRST);
      setPassword("");
      setRepeatPassword("");
      setFirstName("");
      setLastName("");
      setCurrency("");
      setErrors({});
      setShowPassword(false);
      setShowRepeatPassword(false);
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [isVisible]);

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
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleContinue = () => {
    if (validateFirstStep()) {
      setSubmitError(null);
      setState(STATE.SECOND);
    }
  };

  const handleSubmit = async () => {
    if (!validateSecondStep()) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      await signUp(mail, password, fullName, currency);
      setState(STATE.CONFIRMATION);
    } catch (error: any) {
      setSubmitError(error?.message || "Sign-up failed. Please try again.");
    } finally {
      setIsSubmitting(false);
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

          <View className="relative">
            <TextInput
              className={`text-black text-[20px] border rounded-full h-[50px] pl-4 pr-16 ${
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
              secureTextEntry={!showPassword}
              textContentType="oneTimeCode"
            />
            <Pressable
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onPress={() => setShowPassword((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={20} color="#4B5563" />
              ) : (
                <Eye size={20} color="#4B5563" />
              )}
            </Pressable>
            {errors.password && (
              <Text className="text-red-500 text-[14px] mt-1">
                {errors.password}
              </Text>
            )}
          </View>

          <View className="relative">
            <TextInput
              className={`text-black text-[20px] border rounded-full h-[50px] pl-4 pr-16 ${
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
              secureTextEntry={!showRepeatPassword}
              textContentType="oneTimeCode"
            />
            <Pressable
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onPress={() => setShowRepeatPassword((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={
                showRepeatPassword
                  ? "Hide repeated password"
                  : "Show repeated password"
              }
            >
              {showRepeatPassword ? (
                <EyeOff size={20} color="#4B5563" />
              ) : (
                <Eye size={20} color="#4B5563" />
              )}
            </Pressable>
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
      ) : state === STATE.SECOND ? (
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
              onPress={() => {
                setSubmitError(null);
                setState(STATE.FIRST);
              }}
              className="bg-gray-400 h-[7px] w-[7px] rounded-full"
            />
            <View className="bg-black h-[7px] w-[7px] rounded-full" />
          </View>

          <TouchableOpacity
            className={`bg-black shadow-md rounded-full h-[50px] flex items-center justify-center ${
              isSubmitting ? "opacity-60" : ""
            }`}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={isSubmitting}
          >
            <Text className="text-white font-bold text-[15px]">
              {isSubmitting ? "Submitting..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          {submitError && (
            <Text className="text-red-500 text-center text-[14px]">
              {submitError}
            </Text>
          )}
        </View>
      ) : (
        <View className="flex flex-col items-center gap-5 mt-[60px] px-6">
          <Text className="text-3xl font-bold text-center">
            Check your inbox
          </Text>
          <Text className="text-center text-lg text-gray-600">
            {`You have been sent an email at ${mail || "your address"}. Check your inbox to validate your email address.`}
          </Text>
          <Text className="text-center text-base text-gray-500">
            After confirming the link, return here and sign in with your new
            credentials.
          </Text>
          <TouchableOpacity
            className="bg-black shadow-md rounded-full h-[50px] px-10 flex items-center justify-center"
            onPress={() => {
              setState(STATE.FIRST);
              setSubmitError(null);
              setPassword("");
              setRepeatPassword("");
              setFirstName("");
              setLastName("");
              setCurrency("");
              setShowPassword(false);
              setShowRepeatPassword(false);
            }}
            activeOpacity={0.85}
          >
            <Text className="text-white font-bold text-[15px]">
              Back to start
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ) : null;
}
