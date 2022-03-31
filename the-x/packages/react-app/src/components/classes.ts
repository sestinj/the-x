import React from "react";
import { primaryHighlight } from ".";

export const rounded: React.CSSProperties = { borderRadius: "8px" };
export const shadow: React.CSSProperties = {
  boxShadow: `0px 0px 4px 4px ${primaryHighlight}`,
};
export const border: React.CSSProperties = {
  border: "2px solid white",
  ...rounded,
};
export const mobileFlex = (isMobile: boolean): React.CSSProperties => {
  return {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: isMobile ? "column" : "row",
  };
};

export const baseDiv: React.CSSProperties = { ...rounded, padding: "12px" };

const hexLetters: any = { A: 10, B: 11, C: 12, D: 13, E: 14, F: 15 };

function parseByte(byte: string) {
  var value = parseInt(byte);
  if (isNaN(value)) {
    value = hexLetters[byte.toUpperCase()];
  }
  if (isNaN(value)) {
    throw "Could not parse byte " + byte;
  }
  return value;
}

function parseHexPair(byte: string) {
  return parseByte(byte.substring(0, 1)) * 16 + parseByte(byte.substring(1, 2));
}

function parseHex(hex: string) {
  const rgb = [hex.substring(1, 3), hex.substring(3, 5), hex.substring(5, 7)]; // 0 is #, not getting alpha rn
  return rgb.map((hexPair) => parseHexPair(hexPair));
}

export function generateGradient(
  startColor: string,
  endColor: string,
  steps: number
) {
  var [r1, g1, b1] = parseHex(startColor);
  const [r2, g2, b2] = parseHex(endColor);

  const gradient = [];
  const rStep = (r2 - r1) / Math.max(steps - 1, 1);
  const gStep = (g2 - g1) / Math.max(steps - 1, 1);
  const bStep = (b2 - b1) / Math.max(steps - 1, 1);
  for (let i = 0; i < steps; i++) {
    gradient.push(
      `rgba(${r1 + rStep * i},${g1 + gStep * i},${b1 + bStep * i},1)`
    );
  }
  return gradient;
}

export const highlightGradient = generateGradient(
  "#ffffff",
  primaryHighlight,
  2
);

export function generateHighlightGradient(n: number) {
  return generateGradient("#ffffff", primaryHighlight, n);
}
