import React from "react";
import Tile from "./Tile";

interface NumberTileProps {
  value: number;
  gridRow: string;
  gridColumn: string;
}

const NumberTile = (props: NumberTileProps) => {
  return (
    <Tile gridColumn={props.gridColumn} gridRow={props.gridRow}>
      <h2>{props.value.toString()}</h2>
    </Tile>
  );
};

export default NumberTile;
