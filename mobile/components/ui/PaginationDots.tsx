import React, { useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";
import { useCarousel } from "@/components/ui/carousel";

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 180,
  mass: 0.5,
};

const DOT_SIZE = 8;
const ACTIVE_DOT_WIDTH = 26;
const DOT_SPACING = 10;

interface PaginationDotsProps {
  total: number;
  activeIndex: number;
  onDotPress?: (index: number) => void;
  /** "dark" = dark dots on light bg (default); "light" = light dots on dark bg */
  mode?: "dark" | "light";
}

/* ──── Individual animated dot ──── */

function Dot({
  index,
  activeIndex,
  onDotPress,
  mode = "dark",
}: {
  index: number;
  activeIndex: number;
  onDotPress?: (index: number) => void;
  mode?: "dark" | "light";
}) {
  const progress = useSharedValue(index === activeIndex ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(index === activeIndex ? 1 : 0, SPRING_CONFIG);
  }, [activeIndex, index]);

  const animatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progress.value,
      [0, 1],
      [DOT_SIZE, ACTIVE_DOT_WIDTH],
    );
    const opacity = interpolate(progress.value, [0, 1], [0.22, 1]);

    const inactiveColor = mode === "dark" ? "#9ca3af" : "#6b7280";
    const activeColor = mode === "dark" ? "#111827" : "#ffffff";

    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [inactiveColor, activeColor],
    );

    return {
      width,
      opacity,
      backgroundColor,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
    };
  });

  return (
    <Pressable
      onPress={() => onDotPress?.(index)}
      hitSlop={12}
      style={styles.pressable}
    >
      <Animated.View style={animatedStyle} />
    </Pressable>
  );
}

/* ──── Standalone PaginationDots ──── */

export default function PaginationDots({
  total,
  activeIndex,
  onDotPress,
  mode = "dark",
}: PaginationDotsProps) {
  if (total <= 1) return null;

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot
          key={i}
          index={i}
          activeIndex={activeIndex}
          onDotPress={onDotPress}
          mode={mode}
        />
      ))}
    </View>
  );
}

/* ──── Carousel-aware PaginationDots ──── */
/* Automatically reads activeIndex & itemCount from Carousel context,
   and tapping a dot scrolls to that index. Must be rendered inside <Carousel>. */

interface CarouselPaginationDotsProps {
  mode?: "dark" | "light";
}

export function CarouselPaginationDots({
  mode = "dark",
}: CarouselPaginationDotsProps) {
  const { currentIndex, itemCount, scrollTo } = useCarousel();

  if (itemCount <= 1) return null;

  return (
    <View style={styles.container}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <Dot
          key={i}
          index={i}
          activeIndex={currentIndex}
          onDotPress={scrollTo}
          mode={mode}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DOT_SPACING,
    paddingTop: 6,
    paddingBottom: 2,
  },
  pressable: {
    justifyContent: "center",
    alignItems: "center",
  },
});
