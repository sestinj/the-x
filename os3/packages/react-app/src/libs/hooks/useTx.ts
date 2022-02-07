import { useState } from "react";
import { useDispatch } from "react-redux";
import { addAlert, Alert } from "../../redux/slices/alertSlice";
import { addTx } from "../../redux/slices/txsSlice";

export enum TxStatusTypes {
  unsent = "Unsent",
  sending = "Sending",
  pending = "Pending",
  confirmed = "Confirmed",
  reverted = "Reverted",
  rejected = "Rejected",
  error = "Error",
}

// export function useViewTx(txFunction: any, ...args: any[]) {

// }

interface UseTxOptions {
  onSend?: () => void;
  onPending?: (tx: any) => void;
  onConfirm?: (receipt: any) => void;
  onReject?: () => void;
  onRevert?: () => void;
  onError?: (err: any) => void;
  title?: string;
  description?: string;
}

function useTx(txFunction: any, options: UseTxOptions, ...args: any[]) {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<TxStatusTypes>(TxStatusTypes.unsent);
  const [receipt, setReceipt] = useState<any | undefined>(undefined);
  const [tx, setTx] = useState<any | undefined>(undefined);
  const [error, setError] = useState<any | undefined>(undefined);

  async function sendTx() {
    if (!txFunction) {
      return;
    }
    if (status !== TxStatusTypes.unsent) {
      return; // Only send once!
    }

    if (options.onSend) {
      options.onSend();
    }
    setStatus(TxStatusTypes.sending);

    const transaction = await txFunction(args);

    setTx(Object.create(transaction));
    setStatus(TxStatusTypes.pending);
    if (options.onPending) {
      options.onPending(transaction);
    }

    dispatch(addTx(transaction.hash));

    try {
      const receipt = await transaction.wait();
      txConfirmed(receipt);
    } catch (err) {
      setStatus(TxStatusTypes.error);
      setError(err);
      if (options.onError) {
        options.onError(err);
      }
    }
  }

  async function txConfirmed(receipt: any) {
    setReceipt(receipt);
    setStatus(TxStatusTypes.confirmed);
    if (options.onConfirm) {
      options.onConfirm(receipt);
    }

    dispatch(
      addAlert({
        title: "Transaction Confirmed",
        message: options.description || "Click here to view on Etherscan",
        id: tx.hash,
      } as Alert)
    );
  }

  return { status, sendTx, receipt, tx, error };
}

export default useTx;
