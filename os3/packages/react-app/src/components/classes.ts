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

export const baseDiv: React.CSSProperties = { ...rounded, padding: "12px" };
