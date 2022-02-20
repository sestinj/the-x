import React from "react";
import "./styles.css";

const Spinner = (props: { style: any }) => {
  return (
    <>
      <svg className="spinner" viewBox="0 0 100 100">
        <circle
          className="path"
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke-width="5"
        ></circle>
        <circle
          className="path2"
          cx="50"
          cy="50"
          r="10"
          fill="none"
          stroke-width="5"
        ></circle>
      </svg>
    </>
  );
};

export default Spinner;
