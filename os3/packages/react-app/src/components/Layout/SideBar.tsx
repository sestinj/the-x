import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  XIcon,
} from "@heroicons/react/solid";
import React, { useState } from "react";
import styled from "styled-components";
import { backgroundColor } from "..";
import useMobileMediaQuery from "../../libs/hooks/useMobileMediaQuery";
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

  const isMobile = useMobileMediaQuery();

  const [open, setOpen] = useState(false);

  const Hoverable = styled.div`
    :hover {
      background-color: #fff1;
    }
  `;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto",
          gridTemplateRows: "auto",
          position: "absolute",
          left: `${5 - (open ? 0 : 90)}px`,
          transitionDelay: "100",
        }}
      >
        <div
          style={{
            width: "auto",
            height: "auto",
            padding: "10px",
            display: "grid",
            gridTemplateColumns: "auto auto",
            gridTemplateRows: `repeat(${SideBarData.length / 2}, 40px)`,
            textAlign: "center",
            background: backgroundColor,
            border: "0.5px dashed gray",
            borderLeft: "none",
            borderTop: "none",
            borderBottomRightRadius: "8px",
          }}
        >
          {SideBarData.map((datum, index) => {
            return (
              <SideBarIcon
                key={index}
                datum={datum}
                isCurrent={index === currentlyOpen}
              ></SideBarIcon>
            );
          })}
        </div>
        <Hoverable
          style={{ gridColumn: "2", cursor: "pointer", display: "flex" }}
          onMouseEnter={() => {
            setOpen(true);
          }}
          onClick={() => {
            setOpen(!open);
          }}
        >
          {isMobile ? (
            open ? (
              <XIcon width="40px" height="40px" color="lightgray"></XIcon>
            ) : (
              <MenuIcon width="40px" height="40px" color="lightgray"></MenuIcon>
            )
          ) : open ? (
            <ChevronLeftIcon
              width="40px"
              height="40px"
              color="lightgray"
            ></ChevronLeftIcon>
          ) : (
            <ChevronRightIcon
              width="40px"
              height="40px"
              color="lightgray"
            ></ChevronRightIcon>
          )}
        </Hoverable>
      </div>
    </>
  );
};

export default SideBar;
