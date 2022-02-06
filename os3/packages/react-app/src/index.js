import "./index.css";

import { ApolloProvider, InMemoryCache } from "@apollo/react-hooks";
import ApolloClient from "apollo-boost";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App";
import Home from "./routes/home";
import Exchange from "./routes/exchange";
import CreateToken from "./routes/createToken";
import ManageToken from "./routes/manageToken";
import Offerings from "./routes/offerings";
import Config from "./config/index.json";
import Store from "./app/store";
import { Provider } from "react-redux";
import NewPair from "./routes/newpair";
import Pools from "./routes/pools";
import Dashboard from "./routes/dashboard";
import Notifications from "./routes/notifications";

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  // uri: "https://api.thegraph.com/subgraphs/name/paulrberg/create-eth-app",
  uri: Config.subgraphUrl,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <Provider store={Store}>
      <App>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="exchange" element={<Exchange />} />
            <Route path="createToken" element={<CreateToken />} />
            <Route path="manageToken" element={<ManageToken />} />
            <Route path="offerings" element={<Offerings />} />
            <Route path="newpair" element={<NewPair />} />
            <Route path="pools" element={<Pools />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="notifications" element={<Notifications />} />
          </Routes>
        </BrowserRouter>
      </App>
    </Provider>
  </ApolloProvider>,
  document.getElementById("root")
);
