import React from "react";
import { InformationCircleIcon } from "@heroicons/react/outline";
import Popover from "./Popover";

interface InfoProps {
  children: string | React.ReactNode | React.ReactNode[];
}

const Info = (props: InfoProps) => {
  return (
    <Popover
      button={
        <InformationCircleIcon
          width="20px"
          height="20px"
          color="white"
          style={{ cursor: "help" }}
        ></InformationCircleIcon>
      }
    >
      {props.children}
    </Popover>
  );
};

export default Info;
