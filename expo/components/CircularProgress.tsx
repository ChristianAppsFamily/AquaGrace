import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CircularProgressProps {
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
  trackColor: string;
  children?: React.ReactNode;
}

export default function CircularProgress({
  progress,
  size,
  strokeWidth,
  color,
  trackColor,
  children,
}: CircularProgressProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [displayOffset, setDisplayOffset] = useState<number>(circumference);
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    if (isWeb) {
      setDisplayOffset(circumference * (1 - progress));
    } else {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, animatedValue, circumference, isWeb]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const renderProgressCircle = () => {
    if (isWeb) {
      return (
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={displayOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      );
    }
    const AnimatedCircle = Animated.createAnimatedComponent(Circle);
    return (
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    );
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {renderProgressCircle()}
      </Svg>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
});
