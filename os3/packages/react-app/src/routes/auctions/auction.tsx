import { gql, useApolloClient, useQuery } from "@apollo/client";
import { Auction } from "@project/subgraph/generated/schema";
import React, { useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { ProviderContext, SignerContext } from "../../App";
import { Button, secondaryDark, TextInput } from "../../components";
import { baseDiv } from "../../components/classes";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import useMobileMediaQuery from "../../libs/hooks/useMobileMediaQuery";
import useTimer from "../../libs/hooks/useTimer";

const GET_AUCTION = gql`
  query getAuctions($id: ID!) {
    auction(id: $id) {
      id
      owner
      price
      supply
      open
      personalStake
      token {
        id
        address
        symbol
        name
      }
      purchases {
        id
        purchaser
        amount
      }
    }
  }
`;

const AuctionPage = () => {
  const { signer } = useContext(SignerContext);
  const { provider } = useContext(ProviderContext);

  const isMobile = useMobileMediaQuery();

  const apolloClient = useApolloClient();
  const dispatch = useDispatch();

  const { auctionId } = useParams();

  const { data: auctionData } = useQuery<{
    auction: Auction & {
      purchases: { id: string; amount: BigInt; purchaser: string }[];
    };
  }>(GET_AUCTION, { variables: { id: auctionId } });

  const [eth, setEth] = useState(0);

  const time = useTimer(new Date(auctionData?.auction.endDate || ""));

  return (
    <Layout>
      <h2>{}</h2>
      <h1>Auction</h1>
      {console.log(auctionId, auctionData)}

      <div
        style={{
          border: "2px solid white",
          borderRadius: "8px",
          overflow: "clip",
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
          height: isMobile ? "" : "50px",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <TextInput
          placeholder="0.00 ETH"
          style={{ borderRight: "1px solid white" }}
          onChange={(ev) => {
            setEth(parseFloat(ev.target.value));
          }}
        ></TextInput>
        <div style={{ alignItems: "center", height: "100%" }}>
          <span
            style={{
              width: "0px",
              top: "6px",
              display: "inline-block",
              overflow: "visible",
              position: "relative",
              zIndex: "10",
              left: "-12px",
              fontSize: "24px",
            }}
          >
            ➡️
          </span>
        </div>

        <TextInput
          disabled
          style={{ borderLeft: "1px solid white", textAlign: "right" }}
          value={`${
            auctionData?.auction.price
              ? eth * parseFloat(auctionData.auction.price.toString())
              : "0.00"
          } ${(auctionData?.auction as any)?.token.symbol}`}
        ></TextInput>
        <Button style={{ margin: "0", borderRadius: "0" }} onClick={() => {}}>
          Purchase
        </Button>
      </div>

      {auctionData?.auction ? (
        <div>Price: {auctionData.auction.price.toString()}</div>
      ) : (
        "Auction not found"
      )}

      <h3>Purchases</h3>
      <Table
        rowData={auctionData?.auction.purchases || []}
        rowCell={(data) => {
          return [data.purchaser, data.amount];
        }}
        rowHeaders={["Address", "Tokens Purchased"]}
        style={{
          backgroundColor: secondaryDark,
          ...baseDiv,
        }}
        cellStyle={{ borderTop: "1px solid white", padding: "10px" }}
      ></Table>
    </Layout>
  );
};

export default AuctionPage;