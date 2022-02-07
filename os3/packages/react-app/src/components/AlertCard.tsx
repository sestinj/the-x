import React, { useEffect } from "react";
import { secondaryDark } from ".";
import { baseDiv, shadow } from "./classes";
import { Alert, archiveAlert } from "../redux/slices/alertSlice";
import { useDispatch } from "react-redux";
import { XIcon } from "@heroicons/react/outline";

// TODO - you keep writing borderRadius: 8px, so what's the best way to make this a standard? maybe ...notation would be cool

interface AlertCardProps {
  alert: Alert;
  lifetime?: number;
}
const AlertCard = (props: AlertCardProps) => {
  const lifetime = props.lifetime || 15;
  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setTimeout(() => {
      dispatch(archiveAlert(props.alert.id));
    }, 1000 * lifetime);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        backgroundColor: secondaryDark,
        ...baseDiv,
        ...shadow,
        paddingRight: "20px",
        paddingLeft: "20px",
      }}
    >
      {/* <FillingBackground></FillingBackground> */}

      <XIcon
        onClick={() => {
          dispatch(archiveAlert(props.alert.id));
        }}
        width="30px"
        height="30px"
        color="white"
        style={{ float: "right", top: "0px", cursor: "pointer" }}
      ></XIcon>

      <b>{props.alert.title}</b>
      <br></br>
      <br></br>
      {props.alert.message}
    </div>
  );
};

export default AlertCard;
