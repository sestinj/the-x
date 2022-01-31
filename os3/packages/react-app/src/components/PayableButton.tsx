import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button, primaryHighlight } from ".";
import { SignerContext } from "../App";
import { BigNumber, ethers } from "ethers";
import ERC20 from "@project/contracts/artifacts/src/Token/ERC20.sol/ERC20.json";

interface PayableButtonProps {
  onClick: () => void;
  requirements: { address: string; amount: number }[];
  spender: string;
  children: React.ReactNode;
}

const PayableButton = (props: PayableButtonProps) => {
  const DEFAULT_ALLOWANCE = 1000000000000;

  const { signer } = useContext(SignerContext);
  const remainingRequirements = [...props.requirements];

  useEffect(() => {
    const checkForApproval = async () => {
      const ownerAddress = await signer?.getAddress();
      while (remainingRequirements.length) {
        const requirement =
          remainingRequirements[remainingRequirements.length - 1];
        const token = new ethers.Contract(
          requirement.address,
          ERC20.abi,
          signer
        );

        const tx: BigNumber = await token.allowance(
          ownerAddress,
          props.spender
        );
        if (tx.gt(requirement.amount)) {
          remainingRequirements.pop();
        } else {
          return;
        }
      }
      setApproved(true);
    };
  }, [signer]);

  const [approved, setApproved] = useState(false);

  const getApproval = async () => {
    const requirement = remainingRequirements[remainingRequirements.length - 1];
    const token = new ethers.Contract(requirement.address, ERC20.abi, signer);
    const tx = await token.approve(
      props.spender,
      Math.max(DEFAULT_ALLOWANCE, requirement.amount)
    );
    await tx.wait();
    // TODO - How do I verify it went through?
    remainingRequirements.pop();
    if (remainingRequirements.length === 0) {
      setApproved(true);
    }
  };
  return (
    <Button
      onClick={approved ? props.onClick : getApproval}
      style={{
        backgroundColor: approved ? "white" : "#0088ff",
        color: approved ? "black" : "white",
      }}
    >
      {approved ? props.children : "Approve access to your tokens first"}
    </Button>
  );
};

export default PayableButton;
