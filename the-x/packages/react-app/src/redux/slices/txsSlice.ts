import { createSlice } from "@reduxjs/toolkit";

export type Tx = string;

export const txsSlice = createSlice({
  name: "txs",
  initialState: { currentTxs: [] as Tx[] },
  reducers: {
    addTx: (state, action) => {
      state.currentTxs = [...state.currentTxs, action.payload];
    },
  },
});

export const { addTx } = txsSlice.actions;
export default txsSlice.reducer;
