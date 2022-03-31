import React from "react";
import { Button } from "../components";
import Layout from "../components/Layout";
import Stepper from "../components/Stepper";
import Auction from "../components/Stepper/NewToken/Auction";
import Confirmation from "../components/Stepper/NewToken/Confirmation";
import Legal from "../components/Stepper/NewToken/Legal";
import Media from "../components/Stepper/NewToken/Media";
import TokenInfo from "../components/Stepper/NewToken/TokenInfo";
import useStepperState from "../libs/hooks/useStepperState";

const NewToken = () => {
  const {
    currentStep,
    updateCurrentStep,
    states,
    steps,
    nextStep,
    previousStep,
  } = useStepperState([
    "Token Info",
    "Auction",
    "Media",
    "Legal",
    "Confirmation",
  ]);
  return (
    <Layout>
      <div style={{ display: "flex", gap: "100px" }}>
        <Stepper
          states={states}
          steps={steps}
          currentStep={currentStep}
          updateCurrentStep={updateCurrentStep}
        ></Stepper>
        <div
          style={{ padding: "40px", alignItems: "center", height: "60vmin" }}
        >
          {currentStep === 0 ? (
            <TokenInfo></TokenInfo>
          ) : currentStep === 1 ? (
            <Auction></Auction>
          ) : currentStep === 2 ? (
            <Media></Media>
          ) : currentStep === 3 ? (
            <Legal></Legal>
          ) : currentStep === 4 ? (
            <Confirmation></Confirmation>
          ) : (
            <></>
          )}
          <br></br>
          <div style={{ bottom: "0px" }}>
            {currentStep === 0 ? null : (
              <Button
                onClick={() => {
                  updateCurrentStep(currentStep - 1);
                }}
                style={{ marginTop: "20px", bottom: "0px" }}
              >
                Previous
              </Button>
            )}

            <Button
              onClick={() => {
                updateCurrentStep(currentStep + 1);
              }}
              style={{ bottom: "0px" }}
            >
              {currentStep === steps.length - 1 ? "Confirm" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewToken;
