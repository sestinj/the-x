import ERC20 from "@project/contracts/artifacts/src/Token/ERC20.sol/ERC20.json";
import { BigNumber, ethers } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { SpecialButton } from ".";
import { SignerContext } from "../App";

interface PayableButtonProps {
  onClick: () => void;
  requirements: { address: string; amount: BigNumber }[];
  spender: string;
  children: React.ReactNode | string | React.ReactNode[];
  style?: React.CSSProperties;
}

const PayableButton = (props: PayableButtonProps) => {
  const DEFAULT_ALLOWANCE = BigNumber.from(10).pow(24);

  const { signer } = useContext(SignerContext);
  const remainingRequirements = [...props.requirements];

  useEffect(() => {
    const checkForApproval = async () => {
      if (props.requirements.length == 0) {
        setApproved(true);
      }
      const ownerAddress = await signer?.getAddress();
      if (!ownerAddress || !props.spender) {
        return;
      }
      console.log(JSON.stringify(remainingRequirements));
      while (remainingRequirements.length) {
        const requirement =
          remainingRequirements[remainingRequirements.length - 1];
        console.log("Checking", requirement);
        if (
          requirement.address === "0x0000000000000000000000000000000000000000"
        ) {
          remainingRequirements.pop();
          continue;
        }
        console.log("a", requirement);
        const token = new ethers.Contract(
          requirement.address,
          ERC20.abi,
          signer
        );
        console.log("b");
        const tx: BigNumber = await token.allowance(
          ownerAddress,
          props.spender
        );
        console.log("c");
        if (tx.gt(requirement.amount)) {
          remainingRequirements.pop();
        } else {
          return;
        }
      }
      setApproved(true);
    };
    checkForApproval();
  }, [signer]);

  const [approved, setApproved] = useState(false);

  const getApproval = async (event: any) => {
    event.preventDefault(); // TODO - does this cause issues with react-hook-forms?
    const requirement = remainingRequirements[remainingRequirements.length - 1];

    const token = new ethers.Contract(requirement.address, ERC20.abi, signer);

    const tx = await token.approve(
      props.spender,
      DEFAULT_ALLOWANCE.gt(requirement.amount)
        ? DEFAULT_ALLOWANCE
        : requirement.amount
    );
    // await tx.wait();
    remainingRequirements.pop();
    if (remainingRequirements.length === 0) {
      setApproved(true);
    }
  };
  return (
    <SpecialButton
      onClick={approved ? props.onClick : getApproval}
      style={{
        ...props.style,
        backgroundColor: approved ? "" : "#0088ff",
        color: approved ? "" : "white",
      }}
    >
      {approved ? props.children : "Approve access to your tokens first"}
    </SpecialButton>
  );
};

export default PayableButton;
