import React from "react";
import "./styles.css";

const Spinner = (props: { style?: any }) => {
  return (
    <>
      <svg className="spinner" viewBox="0 0 100 100">
        <polygon
          points="50,70 70,50 50,30 30,50"
          style={{ stroke: "black", strokeWidth: "1", fill: "transparent" }}
          className="path"
        ></polygon>
        <polygon
          points="50,60 60,50 50,40 40,50"
          style={{
            stroke: "black",
            strokeWidth: "1",
            fill: "transparent",
          }}
          className="path2"
        ></polygon>
        {/* <circle
          className="path"
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke-width="1"
        ></circle>
        <circle
          className="path2"
          cx="50"
          cy="50"
          r="10"
          fill="none"
          stroke-width="1"
        ></circle> */}
      </svg>
    </>
  );
};

export default Spinner;
