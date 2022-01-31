import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { backgroundColor } from "..";
import SideBarData from "./SideBarData";
import SideBarIcon from "./SideBarIcon";

const SideBar = () => {
  let currentlyOpen = -1;
  for (let i = 0; i < SideBarData.length; i++) {
    if (SideBarData[i].route === window.location.pathname) {
      currentlyOpen = i;
      break;
    }
  }

  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto",
          gridTemplateRows: "auto",
          position: "fixed",
          left: `${5 - (open ? 0 : 70)}px`,
          transitionDelay: "100",
        }}
      >
        <div
          style={{
            width: "auto",
            height: "auto",
            padding: "10px",
            display: "grid",
            gridTemplateColumns: "auto",
            gridTemplateRows: `repeat(${SideBarData.length}, 60px)`,
            textAlign: "center",
            background: backgroundColor,
            border: "1px solid white",
            borderRadius: "8px",
          }}
        >
          {SideBarData.map((datum, index) => {
            return (
              <SideBarIcon
                key={index}
                datum={datum}
                isCurrent={index == currentlyOpen}
              ></SideBarIcon>
            );
          })}
        </div>
        <div
          style={{ gridColumn: "2", cursor: "pointer", display: "flex" }}
          onMouseEnter={() => {
            setOpen(true);
          }}
          onClick={() => {
            setOpen(false);
          }}
        >
          {open ? (
            <ChevronLeftIcon
              width="30px"
              height="30px"
              color="lightgray"
            ></ChevronLeftIcon>
          ) : (
            <ChevronRightIcon
              width="30px"
              height="30px"
              color="lightgray"
            ></ChevronRightIcon>
          )}
        </div>
      </div>
    </>
  );
};

export default SideBar;
