import styled from "styled-components";

export const SimpleTextInput = styled.input.attrs((props) => ({
  type: "text",
}))`
  border-radius: 4px;
  padding: 8px;

  :hover {
    background-color: #ffff0022;
  }

  ${(props) => props.hidden && "hidden"} :focus {
    border: none;
    outline: 2px solid black;
  }
`;

export const SimplePasswordInput = styled.input.attrs((props) => ({
  type: "password",
}))`
  border-radius: 4px;
  padding: 8px;

  :hover {
    background-color: #ffff0022;
  }

  ${(props) => props.hidden && "hidden"} :focus {
    border: none;
    outline: 2px solid black;
  }
`;

export const SimpleLabel = styled.label`
  font-size: 12px;
  color: gray;
`;

export const SimpleCancel = styled.button`
  border-radius: 4px;
  background-color: gray;
  color: black;
  padding: 8px;
  cursor: pointer;
  border: none;
`;

export const SimpleSubmit = styled.input.attrs((props) => ({
  type: "submit",
}))`
  border-radius: 4px;
  background-color: #0080ff;
  color: white;
  padding: 8px;
  cursor: pointer;
  border: none;
`;
