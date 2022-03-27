import { ApolloProvider, InMemoryCache } from "@apollo/react-hooks";
import ApolloClient from "apollo-boost";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import Store from "./app/store";
import Config from "./config/index.json";
import "./index.css";
import AuctionPage from "./routes/auctions/auction";
import Auctions from "./routes/auctions/index";
import Ceramic from "./routes/ceramic";
import CreateToken from "./routes/createToken";
import Dashboard from "./routes/dashboard";
import Exchange from "./routes/exchange";
import Faucet from "./routes/faucet";
import Home from "./routes/home";
import ManageToken from "./routes/manageToken";
import NewPair from "./routes/newpair";
import Notifications from "./routes/notifications";
import Offerings from "./routes/offerings";
import Pools from "./routes/pools";
import Portfolio from "./routes/portfolio";

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
            <Route path="faucet" element={<Faucet />} />
            <Route path="auctions" element={<Auctions />}></Route>
            <Route path="auctions/:auctionId" element={<AuctionPage />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="ceramic" element={<Ceramic />} />
          </Routes>
        </BrowserRouter>
      </App>
    </Provider>
  </ApolloProvider>,
  document.getElementById("root")
);
