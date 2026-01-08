import {
  View,
  Modal,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Dimensions,
  PanResponder,
  Text,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";

type DateRange = {
  start: Date;
  end: Date;
};

type Props = {
  isOpen: boolean;
  startDate: Date;
  endDate: Date;
  onClose: () => void;
  onApply: (range: DateRange) => void;
};

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const normalizeDate = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function FilterModal({
  isOpen,
  startDate,
  endDate,
  onClose,
  onApply,
}: Props) {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [selection, setSelection] = useState<DateRange>(() => ({
    start: normalizeDate(startDate),
    end: normalizeDate(endDate),
  }));
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(startDate.getFullYear(), startDate.getMonth(), 1),
  );

  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const animateTo = (toValue: number, callback?: () => void) => {
    Animated.timing(sheetPosition, {
      toValue,
      duration: 220,
      useNativeDriver: true,
    }).start(() => callback && callback());
  };

  useEffect(() => {
    if (isOpen) {
      setSelection({
        start: normalizeDate(startDate),
        end: normalizeDate(endDate),
      });
      setVisibleMonth(
        new Date(startDate.getFullYear(), startDate.getMonth(), 1),
      );
      setIsVisible(true);
      sheetPosition.setValue(SCREEN_HEIGHT);
      animateTo(0);
      return;
    }

    animateTo(SCREEN_HEIGHT, () => {
      setIsVisible(false);
    });
  }, [isOpen, startDate, endDate, SCREEN_HEIGHT, sheetPosition]);

  const handleClose = () => {
    animateTo(SCREEN_HEIGHT, () => {
      setIsVisible(false);
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
        Math.abs(gestureState.dy) > 2,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          sheetPosition.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.6) {
          handleClose();
        } else {
          animateTo(0);
        }
      },
    }),
  ).current;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1,
    );
    const leading = firstDay.getDay();
    const totalDays = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0,
    ).getDate();
    const slots: Array<Date | null> = [];
    for (let i = 0; i < leading; i += 1) slots.push(null);
    for (let day = 1; day <= totalDays; day += 1) {
      slots.push(
        new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day),
      );
    }
    return slots;
  }, [visibleMonth]);

  const rangeLabel = `${selection.start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} - ${selection.end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  const handleSelectDay = (day: Date) => {
    setSelection((prev) => {
      const normalized = normalizeDate(day);

      // start a new range if one already exists
      if (prev.start.getTime() !== prev.end.getTime()) {
        return { start: normalized, end: normalized };
      }

      if (normalized.getTime() < prev.start.getTime()) {
        return {
          start: normalized,
          end: prev.start,
        };
      }

      if (normalized.getTime() === prev.start.getTime()) {
        return prev;
      }

      return {
        start: prev.start,
        end: normalized,
      };
    });
  };

  const handleApply = () => {
    onApply({
      start: new Date(selection.start),
      end: new Date(selection.end),
    });
  };

  const changeMonth = (delta: number) => {
    setVisibleMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );
  };

  return (
    <Modal
      animationType="none"
      transparent
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={{
            transform: [{ translateY: sheetPosition }],
            backgroundColor: "white",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 20,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View className="flex items-center">
              <View
                {...panResponder.panHandlers}
                style={{
                  height: 32,
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View className="bg-gray-400 w-[50px] h-[5px] rounded-full" />
              </View>
            </View>
            <Text className="text-3xl font-extrabold text-black mb-4">
              Filter
            </Text>
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xl font-extrabold text-black">Date</Text>
                <Text className="text-sm text-gray-500">{rangeLabel}</Text>
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <TouchableOpacity
                  onPress={() => changeMonth(-1)}
                  className="p-2"
                >
                  <Text className="text-lg">‹</Text>
                </TouchableOpacity>
                <Text className="text-base font-medium text-gray-700">
                  {`${monthNames[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`}
                </Text>
                <TouchableOpacity
                  onPress={() => changeMonth(1)}
                  className="p-2"
                >
                  <Text className="text-lg">›</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-between mb-1 px-2">
                {weekdays.map((day) => (
                  <Text
                    key={day}
                    className="flex-1 text-center text-xs font-semibold text-gray-400"
                  >
                    {day}
                  </Text>
                ))}
              </View>
              <View className="flex-row flex-wrap">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return (
                      <View
                        key={`blank-${index}`}
                        style={{ width: `${100 / 7}%`, height: 34 }}
                      />
                    );
                  }
                  const isStart = sameDay(day, selection.start);
                  const isEnd = sameDay(day, selection.end);
                  const inRange = day > selection.start && day < selection.end;
                  const bgClass =
                    isStart || isEnd
                      ? "bg-black"
                      : inRange
                        ? "bg-gray-200"
                        : "bg-transparent";
                  const textClass =
                    isStart || isEnd ? "text-white" : "text-gray-800";
                  return (
                    <View
                      key={day.toISOString()}
                      style={{ width: `${100 / 7}%`, height: 34 }}
                      className="items-center mb-[2px]"
                    >
                      <TouchableOpacity
                        onPress={() => handleSelectDay(day)}
                        className={`w-8 h-8 rounded-full items-center justify-center ${bgClass}`}
                      >
                        <Text className={`text-xs font-semibold ${textClass}`}>
                          {day.getDate()}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
            <TouchableOpacity
              onPress={handleApply}
              className="bg-black rounded-full py-3 mt-6"
            >
              <Text className="text-center text-white font-semibold">
                Apply
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
