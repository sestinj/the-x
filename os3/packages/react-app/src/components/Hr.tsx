import React from "react";

const Hr = () => {
  return (
    <svg height="42" width="800" style={{ marginTop: "60px" }}>
      <polygon
        points="400,40 420,20 400,0 380,20"
        style={{ stroke: "white", strokeWidth: "1" }}
      ></polygon>
      <polygon
        points="400,30 410,20 400,10 390,20"
        style={{
          stroke: "white",
          strokeWidth: "1",
          fill: "transparent",
        }}
      ></polygon>
      <line
        x1="420"
        y1="20"
        x2="800"
        y2="20"
        style={{ stroke: "white", strokeWidth: "1" }}
      ></line>
      <line
        x1="380"
        y1="20"
        x2="0"
        y2="20"
        style={{ stroke: "white", strokeWidth: "1" }}
      ></line>
    </svg>
  );
};

export default Hr;
