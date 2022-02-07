import React from "react";
import { Rotate } from ".";

const Spinner = (props: { style: any }) => {
  return (
    <>
      <Rotate>
        <img
          style={{ width: "50px", height: "50px", ...props.style }}
          src="x.svg"
        ></img>
      </Rotate>
    </>
  );
};

export default Spinner;
