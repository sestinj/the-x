import React from "react";
import useTimer from "../libs/hooks/useTimer";
interface TimerProps {
  endDate: Date;
}

const Timer = (props: TimerProps) => {
  const time = useTimer(props.endDate);
  return (
    <h2>
      {time.getDay()} days : {time.getHours()} hrs : {time.getMinutes()} min :{" "}
      {time.getSeconds()} s
    </h2>
  );
};

export default Timer;
