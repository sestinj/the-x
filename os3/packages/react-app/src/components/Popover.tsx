import React, { useState } from "react";
import { baseDiv } from "./classes";
// TODO - Should definitely be using subcomponenents here
interface PopoverProps {
  button: React.ReactNode;
  children: React.ReactNode | React.ReactNode[] | string;
}

const Popover = (props: PopoverProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateRows: "auto",
          gridTemplateColumns: "auto auto",
          alignContent: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{ gridColumn: "1" }}
          onMouseEnter={() => {
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
        >
          {props.button}
        </div>
        {isHovered ? (
          <div
            style={{
              backgroundColor: "#323232cc",
              color: "white",
              position: "absolute",
              gridColumn: "2",
              ...baseDiv,
              marginLeft: "24px",
              width: "auto",
              maxWidth: "30vmax",
            }}
          >
            {props.children}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Popover;
