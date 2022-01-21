import React, { useState } from "react";

const Logo = (props: { letter: string }) => {
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
        src={`${letter}.svg`}
        style={{
          width: "50px",
          height: "50px",
          filter: "invert(1)",
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
