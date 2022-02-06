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
              width="30px"
              height="30px"
              color={props.isCurrent ? "gray" : "white"}
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
