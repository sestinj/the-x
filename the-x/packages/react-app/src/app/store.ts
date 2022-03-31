import { configureStore } from "@reduxjs/toolkit";
import txsReducer, { Tx } from "../redux/slices/txsSlice";
import alertsReducer, { Alert } from "../redux/slices/alertSlice";

export interface RootStore {
  txs: {
    txs: Tx[];
  };
  alerts: { alerts: Alert[] };
}

export default configureStore({
  reducer: {
    txs: txsReducer,
    alerts: alertsReducer,
  },
});
