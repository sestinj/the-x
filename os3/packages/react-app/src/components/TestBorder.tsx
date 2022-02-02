import { JsonRpcProvider } from "@ethersproject/providers";
import React, { useState } from "react";
import { primaryHighlight } from ".";
interface TestBorderProps {
  provider: JsonRpcProvider;
  children: React.ReactNode;
}

const BORDER_WIDTH = 4;

const TestBorder = (props: TestBorderProps) => {
  return (
    <>
      <div
        hidden={
          !(
            props.provider?.network?.name === "ropsten" ||
            props.provider?.network?.name === "rinkeby"
          )
        }
        style={{
          border: `${BORDER_WIDTH}px solid ${primaryHighlight}`,
          height: `calc(100% - ${2 * BORDER_WIDTH}px)`,
          width: `calc(100% - ${2 * BORDER_WIDTH}px)`,
          position: "fixed",
          borderRadius: "8px",
          backgroundColor: "transparent",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            backgroundColor: primaryHighlight,
            position: "absolute",
            left: "calc(50% - 50px)",
            width: "100px",
            height: "auto",
            top: "0px",
            borderBottomLeftRadius: "4px",
            borderBottomRightRadius: "4px",
            color: "white",
            paddingLeft: "8px",
            paddingRight: "6px",
          }}
        >
          Test Network
        </div>
      </div>
      {props.children}
    </>
  );
};

export default TestBorder;
