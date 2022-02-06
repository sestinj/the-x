import { createSlice } from "@reduxjs/toolkit";

export type Alert = { title: string; message: string; id: string };

export const alertSlice = createSlice({
  name: "alerts",
  initialState: {
    alerts: [
      {
        title: "This is an alert",
        message: "They'll show up when you make transactions. v1.2",
        id: "1234567890",
      },
    ] as Alert[],
    archivedAlerts: [] as Alert[],
  },
  reducers: {
    addAlert: (state, action) => {
      state.alerts = [...state.alerts, action.payload];
    },
    archiveAlert: (state, action) => {
      let archivedAlert: Alert | null = null;
      state.alerts = [
        ...state.alerts.filter((alert) => {
          if (alert.id !== action.payload) {
            return true;
          } else {
            archivedAlert = alert;
            return false;
          }
        }),
      ];
      console.log("STATE: ", state.alerts, archivedAlert);
      if (archivedAlert) {
        state.archivedAlerts = [...state.archivedAlerts, archivedAlert];
      }
    },
  },
});

export const { addAlert, archiveAlert } = alertSlice.actions;
export default alertSlice.reducer;
