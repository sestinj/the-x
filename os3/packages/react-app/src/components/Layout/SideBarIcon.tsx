import React, { useState } from "react";
import { Link } from "react-router-dom";
import Popover from "../Popover";

interface SideBarIconProps {
  datum: { title: string; route: string; icon: any };
  isCurrent: boolean;
}

const SideBarIcon = (props: SideBarIconProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={props.datum.route}>
      <div
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        <Popover
          button={
            <props.datum.icon
              style={{
                transform: isHovered ? "scale(1.2)" : "none",
              }}
              width="40px"
              height="40px"
              color={props.isCurrent ? "lightgray" : "white"}
            ></props.datum.icon>
          }
        >
          {props.datum.title}
        </Popover>
      </div>
    </Link>
  );
};

export default SideBarIcon;
