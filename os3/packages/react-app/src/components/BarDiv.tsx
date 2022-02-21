import React from "react";
import useMobileMediaQuery from "../libs/hooks/useMobileMediaQuery";
import { mobileFlex } from "./classes";

interface BarDivProps {
  children?:
    | (React.ReactChild | string | undefined)[]
    | React.ReactChild
    | string
    | undefined;
}

const BarDiv = (props: BarDivProps) => {
  const isMobile = useMobileMediaQuery();

  return (
    <div
      style={{
        border: "2px solid white",
        borderRadius: "8px",
        overflow: "clip",
        height: isMobile ? "" : "50px",
        ...mobileFlex(isMobile),
      }}
    >
      {props.children}
    </div>
  );
};

export default BarDiv;

export const BarSubdiv = (props: {
  children: React.ReactChild[] | React.ReactChild | string;
}) => {
  return (
    <div style={{ display: "flex", alignItems: "stretch" }}>
      {props.children}
    </div>
  );
};

export const BarArrowSpan = (props: { action: () => void }) => {
  const isMobile = useMobileMediaQuery();
  return (
    <span
      style={{
        width: "0px",
        height: "0px",
        top: "-16px",
        display: "inline-block",
        overflow: "visible",
        position: "relative",
        zIndex: "2",
        left: "-12px",
        fontSize: "24px",
        cursor: "pointer",
      }}
      onClick={props.action}
    >
      {isMobile ? "⬇️" : "➡️"}
    </span>
  );
};
