import { gql, useApolloClient, useQuery } from "@apollo/client";
import { XCircleIcon } from "@heroicons/react/outline";
import { CheckCircleIcon } from "@heroicons/react/solid";
import { Auction } from "@project/subgraph/generated/schema";
import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import { ProviderContext, SignerContext } from "../../App";
import { secondaryDark } from "../../components";
import { baseDiv } from "../../components/classes";
import Info from "../../components/Info";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import useMobileMediaQuery from "../../libs/hooks/useMobileMediaQuery";

const GET_ALL_AUCTIONS = gql`
  query getAuctions {
    auctions {
      id
      owner
      price
      supply
      open
      personalStake
      purchases {
        id
        purchaser
        amount
      }
      token {
        id
        symbol
        name
      }
    }
  }
`;

const Auctions = () => {
  const { signer } = useContext(SignerContext);
  const { provider } = useContext(ProviderContext);

  const isMobile = useMobileMediaQuery();

  const apolloClient = useApolloClient();
  const dispatch = useDispatch();

  const { data: auctionData } = useQuery<{
    auctions: (Auction & {
      purchases: { id: string; amount: BigInt; purchaser: string }[];
      token: { id: string; address: string; symbol: string; name: string };
    })[];
  }>(GET_ALL_AUCTIONS);

  return (
    <Layout>
      <div style={{ display: "flex" }}>
        <h1>Auctions</h1>
        <Info>
          Auctions help new tokens find their fair price before going live on
          the market, and give you an early access investment opportunity.
        </Info>
      </div>
      {console.log("Auction data: ", auctionData)}
      <Table
        style={{
          backgroundColor: secondaryDark,
          ...baseDiv,
        }}
        cellStyle={{ borderTop: "1px solid white", padding: "10px" }}
        rowHeaders={["Open", "Symbol", "Price (ETH)", "TVL", "Purchasers"]}
        rowAction={(data) => {
          window.open(`/auctions/${data.id}`, "_self");
        }}
        rowCell={(data) => {
          return [
            data.open ? (
              <CheckCircleIcon
                width="30px"
                height="30px"
                color="green"
              ></CheckCircleIcon>
            ) : (
              <XCircleIcon width="30px" height="30px" color="red"></XCircleIcon>
            ),
            <div>{data.token.symbol}</div>,
            <div>{data.price}</div>,
            <div>
              {parseFloat((data.supply as any) as string) *
                parseFloat((data.price as any) as string)}{" "}
              TVL
            </div>,
            <div>{data.purchases.length}</div>,
          ];
        }}
        rowData={auctionData?.auctions || []}
      ></Table>
    </Layout>
  );
};

export default Auctions;
