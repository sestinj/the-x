import React, { useState } from "react";
import { secondaryDark } from "../..";
import { baseDiv } from "../../classes";

interface TileProps {
  gridRow: string;
  gridColumn: string;
  children: React.ReactNode[] | React.ReactNode | string;
  editing?: boolean;
}

const Tile = (props: TileProps) => {
  const [dragging, setDragging] = useState(false);
  const [mouseX, setMouseX] = useState<number | undefined>();
  const [mouseY, setMouseY] = useState<number | undefined>();

  return (
    <div
      style={{
        ...baseDiv,
        backgroundColor: secondaryDark,
        gridRow: props.gridRow,
        gridColumn: props.gridColumn,
        textAlign: "center",
        alignItems: "center",
        display: "grid",
        alignContent: "center",
        cursor: dragging ? "grab" : "pointer",
        transform: dragging ? "rotate(4deg)" : "none",
        // position: dragging ? "absolute" : "initial",
        // top: dragging ? mouseY?.toString() + "px" : "initial",
        // left: dragging ? mouseX?.toString() + "px" : "initial",
        transformOrigin: dragging
          ? `-${mouseY?.toString()}px ${mouseX?.toString()}px`
          : "0 0",
      }}
      onMouseDown={() => {
        setDragging(true);
      }}
      onMouseUp={() => {
        setDragging(false);
      }}
      onMouseMove={(ev) => {
        setMouseX(ev.clientX);
        setMouseY(ev.clientY);
      }}
      onMouseLeave={() => {
        setDragging(false);
      }}
    >
      {props.children}
    </div>
  );
};

export default Tile;
