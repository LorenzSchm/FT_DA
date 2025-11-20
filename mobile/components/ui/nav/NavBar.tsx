import { TextInput, View, TouchableOpacity, Animated, useWindowDimensions } from "react-native";
import { Bell, Search, User, X } from "lucide-react-native";
import { useState, useRef, useEffect } from "react";

export default function NavBar() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchWidth = useRef(new Animated.Value(222)).current;
  const leftIconOpacity = useRef(new Animated.Value(1)).current;
  const leftIconWidth = useRef(new Animated.Value(40)).current;
  const rightIconOpacity = useRef(new Animated.Value(1)).current;
  const rightIconWidth = useRef(new Animated.Value(40)).current;
  const inputRef = useRef(null);
  const { width } = useWindowDimensions();

  const expandedWidth = width - 32;

  useEffect(() => {
    if (isSearchExpanded) {
      Animated.parallel([
        Animated.timing(searchWidth, {
          toValue: expandedWidth,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(leftIconOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(leftIconWidth, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(rightIconOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(rightIconWidth, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.sequence([
        Animated.timing(searchWidth, {
          toValue: 222,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.parallel([
          Animated.timing(leftIconOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
          }),
          Animated.timing(leftIconWidth, {
            toValue: 40,
            duration: 150,
            useNativeDriver: false,
          }),
          Animated.timing(rightIconOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
          }),
          Animated.timing(rightIconWidth, {
            toValue: 40,
            duration: 150,
            useNativeDriver: false,
          }),
        ]),
      ]).start();
    }
  }, [isSearchExpanded, expandedWidth]);

  const handleSearchChange = (text) => {
    setSearchText(text);
    if (text.length > 0 && !isSearchExpanded) {
      setIsSearchExpanded(true);
    }
  };

  const handleClose = () => {
    setIsSearchExpanded(false);
    setSearchText("");
    inputRef.current?.blur();
  };

  return (
    <View className={"bg-white flex-row justify-evenly items-center pt-20 p-4"}>
      <Animated.View
        style={{
          opacity: leftIconOpacity,
          width: leftIconWidth,
          overflow: 'hidden'
        }}
        pointerEvents={isSearchExpanded ? "none" : "auto"}
      >
        <View className={"bg-[#F1F1F2] rounded-full p-2 w-[40px] h-[40px] flex justify-center items-center "}>
          <User />
        </View>
      </Animated.View>

      <Animated.View
        style={{ width: searchWidth }}
        className={"bg-[#F1F1F2] rounded-full p-2 flex flex-row items-center"}
      >
        <Search className={"text-[#9FA1A4]"} size={20} />
        <TextInput
          ref={inputRef}
          placeholder={"Search"}
          className={"bg-transparent ml-2 text-2xl text-black flex-1"}
          value={searchText}
          onChangeText={handleSearchChange}
          onFocus={() => setIsSearchExpanded(true)}
        />
        {isSearchExpanded && (
          <TouchableOpacity onPress={handleClose}>
            <X className={"text-[#9FA1A4]"} size={20} />
          </TouchableOpacity>
        )}
      </Animated.View>

      <Animated.View
        style={{
          opacity: rightIconOpacity,
          width: rightIconWidth,
          overflow: 'hidden'
        }}
        pointerEvents={isSearchExpanded ? "none" : "auto"}
      >
        <View className={"bg-[#F1F1F2] rounded-full p-2 w-[40px] h-[40px] flex justify-center items-center "}>
          <Bell />
        </View>
      </Animated.View>
    </View>
  );
}