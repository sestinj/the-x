import { InformationCircleIcon } from "@heroicons/react/outline";
import React from "react";
import Popover from "./Popover";

interface InfoProps {
  children: string | React.ReactNode | React.ReactNode[];
  style?: React.CSSProperties;
}

const Info = (props: InfoProps) => {
  return (
    <Popover
      button={
        <InformationCircleIcon
          width="20px"
          height="20px"
          color="white"
          style={{ cursor: "help", ...props.style }}
        ></InformationCircleIcon>
      }
    >
      {props.children}
    </Popover>
  );
};

export default Info;
