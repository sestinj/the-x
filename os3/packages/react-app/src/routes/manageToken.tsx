import { gql, useQuery } from "@apollo/client";
import React from "react";
import Plot from "react-plotly.js";
import { backgroundColor, Button, Link, primaryHighlight } from "../components";
import Layout from "../components/Layout";

// TODO - add a token image URL, etc... Description for auction page, etc... THis might be how you can introduce an IPFS file hosting tool

const ManageToken = () => {
  const { loading, error, data: tokenData } = useQuery(
    gql`
      {
        tokens {
          address
          name
          symbol
          volume
        }
      }
    `,
    {
      variables: { language: "english" },
    }
  );

  // The Graph makes a great GraphQL database, but what happens when you need high performance databases for other purposes? Like time series data to display token prices over time? It seems there is a whole wave of AWS type services coming for crypto.

  const fakeX = [];
  const fakeY = [];
  let last = 1.0;
  for (let i = 0; i < 10000; i++) {
    fakeX.push(i);
    last = last * (0.99 + Math.random() / 49);
    fakeY.push(last);
  }

  const plotlyLayout = {
    width: 640,
    height: 360,
    title: "Token Price",
    plot_bgcolor: backgroundColor,
    paper_bgcolor: backgroundColor,
    font: {
      color: "white",
    },
    xaxis: {
      color: "white",
    },
    yaxis: {
      color: "white",
    },
  };

  return (
    <Layout>
      <h1>
        {tokenData?.name} ({tokenData?.symbol})
      </h1>
      <Link to="/exchange">View On Exchange</Link>
      <div style={{ display: "flex" }}>
        <Plot
          data={[
            {
              x: fakeX,
              y: fakeY,
              mode: "lines",
              marker: { color: primaryHighlight },
            },
          ]}
          layout={plotlyLayout}
        />

        <Plot
          data={[
            {
              values: [19, 26, 55],
              labels: ["Me", "Family and Friends", "Others"], // Can let people keep track of how much people at certain addresses own
              type: "pie",
            },
          ]}
          layout={{ ...plotlyLayout, title: "Token Ownership" }}
        />
      </div>
      <Button>Raise Another Round</Button>
    </Layout>
  );
};

export default ManageToken;
