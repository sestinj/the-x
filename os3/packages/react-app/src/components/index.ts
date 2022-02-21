import * as ReactRouterDOM from "react-router-dom";
import styled, { keyframes } from "styled-components";

export const backgroundColor = "#161616";
export const secondaryDark = "#323232";
export const primaryHighlight = "#8800ff";
export const BORDER_RADIUS = "8px";

export const Header = styled.header`
  background-color: ${backgroundColor};
  min-height: 70px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  color: white;
  padding-right: 20px;
  border-bottom: 0.5px dashed gray;

  & ::selection {
    background: ${primaryHighlight}; /* WebKit/Blink Browsers */
  }
  & ::-moz-selection {
    background: ${primaryHighlight}; /* Gecko Browsers */
  }
`;

export const Body = styled.div`
  align-items: center;
  background-color: ${backgroundColor};
  color: white;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  justify-content: center;
  min-height: calc(100vh - 70px);
  padding: 20px;
  overflow: hidden;

  & ::selection {
    background: ${primaryHighlight}; /* WebKit/Blink Browsers */
  }
  & ::-moz-selection {
    background: ${primaryHighlight}; /* Gecko Browsers */
  }
`;

export const Image = styled.img`
  height: 40vmin;
  margin-bottom: 16px;
  pointer-events: none;
`;

export const A = styled.a`
  color: ${primaryHighlight};

  :visited {
    color: ${primaryHighlight};
  }
`;

export const Link = styled(ReactRouterDOM.Link).attrs({
  target: "_blank",
  rel: "noopener noreferrer",
})`
  color: #61dafb;
  margin-top: 10px;

  :visited {
    color: ${primaryHighlight};
  }
`;

export const Button = styled.button`
  background-color: white;
  border: none;
  border-radius: 8px;
  color: ${backgroundColor};
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  margin: 0px 20px;
  padding: 12px 24px;
  justify-content: center;

  :hover {
    box-shadow: 0px 0px 4px 4px ${primaryHighlight};
  }

  ${(props) => props.hidden && "hidden"} :focus {
    border: none;
    outline: none;
  }
`;

export const SpecialButton = styled.button`
  background-color: ${primaryHighlight};
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  padding: 12px 24px;

  :hover {
    filter: brightness(0.85);
  }

  ${(props) => props.hidden && "hidden"} :focus {
    border: none;
    outline: none;
  }
`;

export const P = styled.p``;

export const TextInput = styled.input`
  border: none;
  background-color: ${secondaryDark};
  font-size: 18px;
  padding: 10px;
  color: white;
  outline: none;

  @media (max-width: 1224px) {
    padding-top: 24px;
    padding-bottom: 24px;
  }
`;

export const Select = styled.select`
  background-color: ${secondaryDark};
  color: white;
  padding: 10px;
  border: none;
  font-size: 18px;
  option: {
    background: orange;
    color: purple;
  }
`;

export const TableCellDiv = styled.div`
  background-color: ${secondaryDark};
  padding: 10px;
  text-align: center;
  font-size: 18px;
`;

export const BaseTable = styled.table`
  border: 1px solid white;
`;

export const Submit = styled.input.attrs((props) => ({
  type: "submit",
}))`
  background-color: white;
  border: none;
  border-radius: 8px;
  color: ${backgroundColor};
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  margin: 0px 20px;
  padding: 12px 24px;

  :hover {
    box-shadow: 0px 0px 4px 4px ${primaryHighlight};
  }

  ${(props) => props.hidden && "hidden"} :focus {
    border: none;
    outline: none;
  }
`;

export const Hr = styled.hr`
  margin: 40px;
`;

export const Console = styled.textarea`
  border: none;
  border-radius: ${BORDER_RADIUS};
  background-color: ${secondaryDark};
  color: white;
  font-family: monospace;
  padding: 10px;
`;

export const HoverDiv = styled.div`
  background-color: #fff;
  :hover {
    background-color: #ccc;
  }
`;

export const GridDiv = styled.div`
  display: grid;
  grid-template: 8vh 8vh 8vh 8vh 8vh 8vh 8vh 8vh / 8vw 8vw 8vw 8vw 8vw 8vw 8vw 8vw 8vw 8vw 8vw 8vw;
  gap: 20px;
  row-gap: 20px;
  column-gap: 20px;
  width: 80%;
  margin: auto;
  /* border-collapse: collapse;
  border: 2px dashed gray;
  div {
    border: 2px dashed gray;
  } */
`;

// ANIMATIONS
const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(360deg) scale(1.5);
  }

  100% {
    transform: rotate(720deg);
  }
`;
export const Rotate = styled.div`
  display: inline-block;
  animation: ${rotate} 3s ease-in-out infinite;
  padding: 2rem 1rem;
  font-size: 1.2rem;
`;

const increaseWidth = keyframes`
  from {
    width: 0%;
  }

  to {
    width: 100%;
  }
`;

export const FillingBackground = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  animation: ${increaseWidth} 15s linear infinite;
  height: 100%;
  background-color: #ffffff44;
`;

const dropShadowSize = 1;
const pulse = keyframes`
  0% {
    filter: drop-shadow(${dropShadowSize}px ${dropShadowSize}px ${dropShadowSize}px ${primaryHighlight}) drop-shadow(${dropShadowSize}px -${dropShadowSize}px ${dropShadowSize}px ${primaryHighlight}) drop-shadow(-${dropShadowSize}px ${dropShadowSize}px ${dropShadowSize}px ${primaryHighlight}) drop-shadow(-${dropShadowSize}px -${dropShadowSize}px ${dropShadowSize}px ${primaryHighlight});
  }

  25% {
    filter: none;
  }
  75% {
    filter: none;
  }
  100% {
    filter: drop-shadow(${dropShadowSize}px ${dropShadowSize}px ${dropShadowSize}px ${primaryHighlight}) drop-shadow(${dropShadowSize}px -${dropShadowSize}px ${dropShadowSize}px ${primaryHighlight}) drop-shadow(-${dropShadowSize}px ${dropShadowSize}px ${dropShadowSize}px ${primaryHighlight}) drop-shadow(-${dropShadowSize}px -${dropShadowSize}px ${dropShadowSize}px ${primaryHighlight});
  }
`;

export const Pulse = styled.div`
  animation: ${pulse} 5s ease-out infinite;
`;
