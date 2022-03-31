import React from "react";
import { useSelector } from "react-redux";
import { selectAllAlerts } from "../redux/selectors/txSelectors";
import AlertCard from "./AlertCard";

const AlertArea = () => {
  const alerts = useSelector(selectAllAlerts);
  return (
    <div
      style={{
        backgroundColor: "transparent",
        position: "fixed",
        height: "100%",
        right: "0",
        top: "50px",
        width: "auto",
        padding: "20px",
      }}
    >
      {alerts.map((alert) => {
        return <AlertCard key={alert.id} alert={alert}></AlertCard>;
      })}
    </div>
  );
};

export default AlertArea;
