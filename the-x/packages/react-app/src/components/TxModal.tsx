import {
  ArrowCircleUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/solid";
import { BigNumber } from "ethers";
import React from "react";
import { A, SpecialButton } from ".";
import config from "../config/index.json";
import { getEtherscanUrlTx } from "../libs/etherscan/index";
import useTx, { TxStatusTypes, UseTxOptions } from "../libs/hooks/useTx";
import Modal from "./Modal";
import PayableButton from "./PayableButton";
import Spinner from "./Spinner";

interface TxModalProps {
  open: boolean;
  closeModal: () => void;
  args: any[];
  children: React.ReactNode | React.ReactNode[] | string;
  txFunction: any;
  options: UseTxOptions;
  confirmMessage?: string;
  requirements?: { address: string; amount: BigNumber }[];
  spender?: string;
}

const TxModal = (props: TxModalProps) => {
  const { error, status, sendTx, tx } = useTx(props.txFunction, props.options);
  return (
    <Modal open={props.open} closeModal={props.closeModal}>
      <div
        style={{
          alignItems: "center",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        {(status === TxStatusTypes.unsent ||
          status === TxStatusTypes.signerNotFound) && (
          <div>{props.children}</div>
        )}
        {status === TxStatusTypes.sending ? (
          <>
            <p>Waiting for approval...</p>
            <Spinner style={{ filter: "invert(1)" }}></Spinner>
            <p>Confirm the transaction in your wallet.</p>
          </>
        ) : status === TxStatusTypes.pending ? (
          <>
            <p>Transaction sent</p>
            <ArrowCircleUpIcon
              strokeWidth={2} // TODO - would look nice.
              width="30%"
              height="30%"
              color="black"
            ></ArrowCircleUpIcon>
          </>
        ) : status === TxStatusTypes.confirmed ? (
          <>
            <p>Transaction confirmed</p>
            <CheckCircleIcon
              width="30%"
              height="30%"
              color="black"
            ></CheckCircleIcon>
          </>
        ) : status === TxStatusTypes.error ? (
          <>
            <p>Error: {error?.toString()}</p>
            <ExclamationCircleIcon
              width="30%"
              height="30%"
              color="black"
            ></ExclamationCircleIcon>
          </>
        ) : (
          <></>
        )}
        {status === TxStatusTypes.unsent || status === TxStatusTypes.sending ? (
          <></>
        ) : (
          <>
            <p>
              View on{" "}
              <A
                href={getEtherscanUrlTx(tx?.hash, config.name)}
                target={"_blank"}
              >
                Etherscan
              </A>
              .
            </p>
          </>
        )}
      </div>
      {status === TxStatusTypes.unsent && (
        <PayableButton
          onClick={() => {
            sendTx(...props.args);
          }}
          requirements={(props.spender && props.requirements) || []}
          spender={props.spender || ""}
          style={{
            width: "100%",
            borderRadius: "0px",
            borderTop: "1px solid black",
          }}
        >
          {props.confirmMessage || "Confirm"}
        </PayableButton>
      )}

      {(status === TxStatusTypes.confirmed ||
        status === TxStatusTypes.error ||
        status === TxStatusTypes.rejected ||
        status === TxStatusTypes.reverted ||
        status === TxStatusTypes.pending) && (
        <SpecialButton
          onClick={props.closeModal}
          style={{
            width: "100%",
            margin: "0px",
            borderRadius: "0px",
            backgroundColor: "white",
            color: "black",
            borderTop: "1px solid black",
          }}
        >
          Close
        </SpecialButton>
      )}

      {/* <SpecialButton
              onClick={() => {
                sendTx(...props.args);
              }}
              style={{ width: "100%", margin: "20px" }}
            >
              {props.confirmMessage || "Confirm"}
            </SpecialButton> */}
    </Modal>
  );
};

export default TxModal;
