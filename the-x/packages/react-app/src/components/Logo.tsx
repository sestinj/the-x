import React, { useState } from "react";

const Logo = (props: { letter: string; style?: React.CSSProperties }) => {
  const [letter, setLetter] = useState(props.letter);
  const letters = ["x", "n", "z"].filter((val) => val !== props.letter);
  return (
    <a href="https://natesesti.com" target={"_blank"}>
      <img
        onMouseEnter={() => {
          setLetter(letters[Math.floor(Math.random() * letters.length)]);
        }}
        onMouseLeave={() => {
          setLetter(props.letter);
        }}
        alt={"The X Logo"}
        src={`/${letter}.svg`}
        style={{
          ...props.style,
          width: "50px",
          height: "50px",
          position: "absolute",
          left: "10px",
          top: "10px",
          cursor: "help",
        }}
      ></img>
    </a>
  );
};

export default Logo;
