import { gql, useApolloClient, useQuery } from "@apollo/client";
import { Auction } from "@project/subgraph/generated/schema";
import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { ProviderContext, SignerContext } from "../../App";
import Layout from "../../components/Layout";
import useMobileMediaQuery from "../../libs/hooks/useMobileMediaQuery";

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
      purchase: { id: string; amount: BigInt; purchaser: string };
    };
  }>(GET_AUCTION);

  return (
    <Layout>
      <h1>Auction</h1>

      {auctionData?.auction ? (
        <div>Price: {auctionData.auction.price.toString()}</div>
      ) : (
        "Auction not found"
      )}
    </Layout>
  );
};

export default AuctionPage;
