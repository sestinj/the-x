import "./index.css";

// import { ApolloProvider } from "@apollo/react-hooks";
// import ApolloClient from "apollo-boost";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App";
import Home from "./routes/home";
import Exchange from "./routes/exchange";

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
// const client = new ApolloClient({
//   uri: "https://api.thegraph.com/subgraphs/name/paulrberg/create-eth-app",
// });

ReactDOM.render(
  // <ApolloProvider client={client}>
  <App>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="home" element={<Home />} />
        <Route path="exchange" element={<Exchange />} />
      </Routes>
    </BrowserRouter>
  </App>,
  // </ApolloProvider>,
  document.getElementById("root")
);
