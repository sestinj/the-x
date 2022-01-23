import styled, { keyframes } from "styled-components";
import * as ReactRouterDOM from "react-router-dom";

export const backgroundColor = "#161616";
export const secondaryDark = "#323232";
export const primaryHighlight = "#8000ff";
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
`;

export const Image = styled.img`
  height: 40vmin;
  margin-bottom: 16px;
  pointer-events: none;
`;

export const Link = styled(ReactRouterDOM.Link).attrs({
  target: "_blank",
  rel: "noopener noreferrer",
})`
  color: #61dafb;
  margin-top: 10px;
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

  :hover {
    box-shadow: 0px 0px 4px 4px ${primaryHighlight};
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
  border: 2px solid white;
  border-radius: 8px;
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
