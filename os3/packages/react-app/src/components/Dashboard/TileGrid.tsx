import { CheckIcon, PencilIcon } from "@heroicons/react/outline";
import React, { useState } from "react";
import { Button, GridDiv } from "..";
import Tile from "./Tiles/Tile";

// This is where you use Redux to let people change their positioning of the tiles, and redo changes they've made.
// Eventually even transactions should be redoable changes, at least for a short amount of time like with Gmail. Is this possible?

interface TileGridProps {
  children: React.ReactNode[];
}

const TileGrid = (props: TileGridProps) => {
  const [editing, setEditing] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setEditing(!editing);
        }}
      >
        <div
          style={{
            display: "grid",
            alignItems: "center",
            gridTemplateColumns: "auto auto",
            columnGap: "10px",
          }}
        >
          {editing ? (
            <CheckIcon
              style={{ gridColumn: "1" }}
              width="20px"
              height="20px"
              color="black"
            ></CheckIcon>
          ) : (
            <PencilIcon
              style={{ gridColumn: "1" }}
              width="20px"
              height="20px"
              color="black"
            ></PencilIcon>
          )}

          <span style={{ gridColumn: "2" }}>{editing ? "Done" : "Edit"}</span>
        </div>
      </Button>
      <GridDiv>{props.children}</GridDiv>
    </>
  );
};

export default TileGrid;
