import React from "react";
import styled from "styled-components";
import { primaryHighlight } from "..";

export enum StepStates {
  done = "Done",
  current = "Current",
  started = "Started",
  todo = "To Do",
}

interface StepperCircleProps {
  title: string;
  number: number;
  state: StepStates;
  onClick: () => void;
}

const StepperCircleDiv = styled.div`
  :hover {
    filter: opacity(0.85);
  }
`;

const StepperCircle = (props: StepperCircleProps) => {
  return (
    <StepperCircleDiv
      style={{
        borderRadius: "50%",
        borderStyle: "solid",
        borderWidth: props.state === StepStates.current ? "2px" : "1px",
        width: "40px",
        height: "40px",
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        borderColor:
          props.state === StepStates.todo ? "gray" : primaryHighlight,
        backgroundColor:
          props.state === StepStates.done ? primaryHighlight : "transparent",
      }}
      onClick={props.onClick}
    >
      {props.number}
    </StepperCircleDiv>
  );
};

interface StepperProps {
  steps: string[];
  currentStep: number;
  updateCurrentStep: (arg0: number) => void;
  states: StepStates[];
}

const Stepper = (props: StepperProps) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {props.steps.map((step, index) => {
        return [
          index !== 0 && (
            <div
              style={{
                height: "50px",
                backgroundColor:
                  props.states[index] !== StepStates.todo
                    ? primaryHighlight
                    : "gray",
                width: "1px",
                margin: "8px",
              }}
              key={`line${index}`}
            ></div>
          ),
          <div style={{ display: "flex" }} key={`div${index}`}>
            <StepperCircle
              title={step}
              number={index}
              state={props.states[index]}
              onClick={() => {
                props.updateCurrentStep(index);
              }}
            />
            <div style={{ width: "0px", height: "0px" }}>
              <p
                style={{
                  position: "relative",
                  left: "8px",
                  width: "100px",
                }}
              >
                {step}
              </p>
            </div>
          </div>,
        ];
      })}
    </div>
  );
};

export default Stepper;
