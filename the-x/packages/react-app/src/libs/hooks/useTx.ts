import { BigNumber } from "ethers";
import { useState } from "react";
import { useDispatch } from "react-redux";
import config from "../../config/index.json";
import { addAlert, Alert } from "../../redux/slices/alertSlice";
import { addTx } from "../../redux/slices/txsSlice";
import { getEtherscanUrlTx } from "../etherscan/index";

export enum TxStatusTypes {
  unsent = "Unsent",
  signerNotFound = "Signer Not Found",
  sending = "Sending",
  pending = "Pending",
  confirmed = "Confirmed",
  reverted = "Reverted",
  rejected = "Rejected",
  error = "Error",
}

// export function useViewTx(txFunction: any, ...args: any[]) {

// }

// TODO - It would be nice if you could overwrite the title and description as you send the tx with pertinent info. Might use spread operator to overwrite options, give an additional UseTxOptions argument in the sendTx function

export interface UseTxOptions {
  onSend?: () => void;
  onPending?: (tx: any) => void;
  onConfirm?: (receipt: any) => void;
  onReject?: () => void;
  onRevert?: () => void;
  onError?: (err: any) => void;
  title?: string;
  description?: string;
  value?: BigNumber;
}

function useTx(txFunction: any, options: UseTxOptions) {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<TxStatusTypes>(TxStatusTypes.unsent);
  const [receipt, setReceipt] = useState<any | undefined>(undefined);
  const [tx, setTx] = useState<any | undefined>(undefined);
  const [error, setError] = useState<any | undefined>(undefined);

  async function sendTx(...args: any[]) {
    if (!txFunction) {
      setStatus(TxStatusTypes.signerNotFound);
      return;
    }
    if (
      status !== TxStatusTypes.unsent &&
      status !== TxStatusTypes.signerNotFound
    ) {
      return; // Only send once!
    }

    if (options.onSend) {
      options.onSend();
    }
    setStatus(TxStatusTypes.sending);

    const transaction = await txFunction(...args, { value: options.value });

    setTx(Object.create(transaction));
    setStatus(TxStatusTypes.pending);
    if (options.onPending) {
      options.onPending(transaction);
    }

    dispatch(addTx(transaction.hash));

    try {
      const receipt = await transaction.wait();
      txConfirmed(receipt, transaction);
    } catch (err) {
      setStatus(TxStatusTypes.error);
      setError(err);
      if (options.onError) {
        options.onError(err);
      }
    }
  }

  async function txConfirmed(receipt: any, transaction: any) {
    setReceipt(receipt);
    setStatus(TxStatusTypes.confirmed);
    if (options.onConfirm) {
      options.onConfirm(receipt);
    }

    dispatch(
      addAlert({
        title: "Transaction Confirmed",
        message: options.description || "Click here to view on Etherscan",
        id: transaction.hash,
        actionUrl: getEtherscanUrlTx(transaction.hash, config.name),
      } as Alert)
    );
  }

  return { status, sendTx, receipt, tx, error };
}

export default useTx;
