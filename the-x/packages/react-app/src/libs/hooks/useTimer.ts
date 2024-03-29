import { useState } from "react";

function useTimer(end: Date) {
  const endTime = end.getTime();
  const [remaining, setRemaining] = useState(
    new Date(endTime - new Date().getTime())
  );
  setInterval(() => {
    setRemaining(new Date(endTime - new Date().getTime()));
  }, 1000);

  return remaining;
}

export default useTimer;
