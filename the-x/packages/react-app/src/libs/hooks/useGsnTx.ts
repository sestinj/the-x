export enum GsnTxStatusTypes {
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

interface UseGsnTxOptions {
  onSend?: () => void;
  onPending?: (tx: any) => void;
  onConfirm?: (receipt: any) => void;
  onReject?: () => void;
  onRevert?: () => void;
  onError?: (err: any) => void;
  title?: string;
  description?: string;
}

function useGsnTx(txFunction: any, options: UseGsnTxOptions, ...args: any[]) {
  //   const dispatch = useDispatch();
  //   const [status, setStatus] = useState<GsnTxStatusTypes>(
  //     GsnTxStatusTypes.unsent
  //   );
  //   const [receipt, setReceipt] = useState<any | undefined>(undefined);
  //   const [tx, setTx] = useState<any | undefined>(undefined);
  //   const [error, setError] = useState<any | undefined>(undefined);
  //   async function sendTx() {
  //     if (!txFunction) {
  //       return;
  //     }
  //     if (status !== GsnTxStatusTypes.unsent) {
  //       return; // Only send once!
  //     }
  //     if (options.onSend) {
  //       options.onSend();
  //     }
  //     setStatus(GsnTxStatusTypes.sending);
  //     //
  //     // SEND THE TX*************
  //     //
  //     setTx(Object.create(transaction));
  //     setStatus(GsnTxStatusTypes.pending);
  //     if (options.onPending) {
  //       options.onPending(transaction);
  //     }
  //     dispatch(addTx(transaction.hash));
  //     try {
  //       // WAIT FOR THE TX*******************
  //       txConfirmed(receipt);
  //     } catch (err) {
  //       setStatus(GsnTxStatusTypes.error);
  //       setError(err);
  //       if (options.onError) {
  //         options.onError(err);
  //       }
  //     }
  //   }
  //   async function txConfirmed(receipt: any) {
  //     setReceipt(receipt);
  //     setStatus(GsnTxStatusTypes.confirmed);
  //     if (options.onConfirm) {
  //       options.onConfirm(receipt);
  //     }
  //     dispatch(
  //       addAlert({
  //         title: "Transaction Confirmed",
  //         message: options.description || "Click here to view on Etherscan",
  //         id: tx.hash,
  //       } as Alert)
  //     );
  //   }
  //   return { status, sendTx, receipt, tx, error };
}

export default useGsnTx;
