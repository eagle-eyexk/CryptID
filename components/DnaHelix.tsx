import React, { useEffect, memo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { DEFAULT_DNA_COLORS } from "@/utils/dna";

const RUNG_COUNT = 14;
const RUNG_SPACING = 22;
const AMPLITUDE = 52;
const PHASE_STEP = (Math.PI * 2) / RUNG_COUNT;
const DOT_SIZE = 13;
const BAR_HEIGHT = 2;

type RungProps = {
  phase: Animated.SharedValue<number>;
  index: number;
  color1: string;
  color2: string;
};

const DnaRung = memo(function DnaRung({ phase, index, color1, color2 }: RungProps) {
  const leftDotStyle = useAnimatedStyle(() => {
    const angle = phase.value * Math.PI * 2 + index * PHASE_STEP;
    const sinV = Math.sin(angle);
    const cosV = Math.cos(angle);
    const x = -AMPLITUDE * sinV;
    // dots "in front" are bigger and brighter
    const scale = 0.55 + 0.45 * (0.5 + 0.5 * cosV);
    const opacity = 0.45 + 0.55 * (0.5 + 0.5 * cosV);
    return { transform: [{ translateX: x }, { scale }], opacity };
  });

  const rightDotStyle = useAnimatedStyle(() => {
    const angle = phase.value * Math.PI * 2 + index * PHASE_STEP;
    const sinV = Math.sin(angle);
    const cosV = -Math.cos(angle); // opposite depth
    const x = AMPLITUDE * sinV;
    const scale = 0.55 + 0.45 * (0.5 + 0.5 * cosV);
    const opacity = 0.45 + 0.55 * (0.5 + 0.5 * cosV);
    return { transform: [{ translateX: x }, { scale }], opacity };
  });

  const barStyle = useAnimatedStyle(() => {
    const angle = phase.value * Math.PI * 2 + index * PHASE_STEP;
    const sinV = Math.sin(angle);
    const absV = Math.abs(sinV);
    return {
      width: absV * AMPLITUDE * 2,
      transform: [{ translateX: -absV * AMPLITUDE }],
      opacity: 0.15 + 0.3 * absV,
    };
  });

  return (
    <View style={[styles.rungRow, { top: index * RUNG_SPACING }]}>
      <Animated.View
        style={[styles.bar, barStyle, { backgroundColor: color1 }]}
      />
      <Animated.View
        style={[styles.dot, leftDotStyle, { backgroundColor: color1 }]}
      />
      <Animated.View
        style={[styles.dot, rightDotStyle, { backgroundColor: color2 }]}
      />
    </View>
  );
});

type Props = {
  colorPairs?: [string, string][];
  size?: "large" | "medium" | "small";
  speed?: number;
};

export default function DnaHelix({
  colorPairs = DEFAULT_DNA_COLORS,
  size = "large",
  speed = 5000,
}: Props) {
  const phase = useSharedValue(0);

  useEffect(() => {
    phase.value = withRepeat(
      withTiming(1, { duration: speed, easing: Easing.linear }),
      -1,
      false
    );
  }, [speed]);

  const scale = size === "large" ? 1 : size === "medium" ? 0.78 : 0.56;
  const containerHeight = RUNG_COUNT * RUNG_SPACING + DOT_SIZE;

  return (
    <View
      style={[
        styles.outerContainer,
        {
          height: containerHeight * scale,
          transform: [{ scale }],
        },
      ]}
    >
      <View style={[styles.helixContainer, { height: containerHeight }]}>
        {Array.from({ length: RUNG_COUNT }).map((_, i) => {
          const pair = colorPairs[i % colorPairs.length];
          return (
            <DnaRung
              key={i}
              phase={phase}
              index={i}
              color1={pair[0]}
              color2={pair[1]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  helixContainer: {
    width: AMPLITUDE * 2 + DOT_SIZE + 20,
    position: "relative",
    alignSelf: "center",
  },
  rungRow: {
    position: "absolute",
    left: 0,
    right: 0,
    height: DOT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  bar: {
    position: "absolute",
    height: BAR_HEIGHT,
    borderRadius: 1,
  },
});
