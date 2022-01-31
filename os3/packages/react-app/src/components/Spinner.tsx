import React from "react";
import { Rotate } from ".";
import Logo from "./Logo";

const Spinner = () => {
  return (
    <>
      <Rotate>
        <img style={{ width: "50px", height: "50px" }} src="x.svg"></img>
      </Rotate>
    </>
  );
};

export default Spinner;