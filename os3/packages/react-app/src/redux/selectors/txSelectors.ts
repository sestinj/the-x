// import { createSelector } from "@reduxjs/toolkit";
// ^^Not entirely sure what this does but might be useful
import { RootStore } from "../../app/store";

export const selectAllTxs = (state: RootStore) => state.txs;

export const selectAllAlerts = (state: RootStore) => state.alerts.alerts;
