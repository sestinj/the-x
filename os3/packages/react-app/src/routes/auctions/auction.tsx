import { gql, useApolloClient, useQuery } from "@apollo/client";
import FixedPriceAuction from "@project/contracts/artifacts/src/auction/FixedPriceAuction.sol/FixedPriceAuction.json";
import { Auction } from "@project/subgraph/generated/schema";
import { ethers } from "ethers";
import React, { useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { ProviderContext, SignerContext } from "../../App";
import { Button, secondaryDark, TextInput } from "../../components";
import BarDiv, { BarArrowSpan, BarSubdiv } from "../../components/BarDiv";
import { baseDiv } from "../../components/classes";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import Timer from "../../components/Timer";
import TxModal from "../../components/TxModal";
import useContract from "../../libs/hooks/useContract";
import useMobileMediaQuery from "../../libs/hooks/useMobileMediaQuery";

const GET_AUCTION = gql`
  query getAuctions($id: ID!) {
    auction(id: $id) {
      id
      endDate
      startDate
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
        blockNumber
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
      purchases: {
        id: string;
        amount: BigInt;
        purchaser: string;
        blockNumber: BigInt;
      }[];
      token: { id: string; address: string; symbol: string; name: string };
    };
  }>(GET_AUCTION, { variables: { id: auctionId } });

  const auctionContract = useContract(
    auctionData?.auction.id || "",
    FixedPriceAuction.abi,
    signer
  );

  const [eth, setEth] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Layout>
      <TxModal
        open={modalOpen}
        closeModal={() => {
          setModalOpen(false);
        }}
        args={[]}
        txFunction={auctionContract?.purchase}
        options={{ value: ethers.utils.parseEther(eth.toString()) }}
      >
        Confirm that you want to purchase {auctionData?.auction.token.symbol}{" "}
        tokens for {eth.toString()}.
      </TxModal>

      <div style={{ display: "grid", gridTemplate: "auto / auto auto" }}>
        <div style={{ gridColumn: "1" }}>
          <h1>{auctionData?.auction.token.name}</h1>
          <h2>{auctionData?.auction.token.symbol}</h2>
        </div>

        <div
          style={{
            border: auctionData?.auction.open
              ? "2px solid green"
              : "2px solid gray",
            ...baseDiv,
            gridColumn: "2",
          }}
        >
          {auctionData?.auction.open ? (
            <Timer
              endDate={
                new Date(
                  parseFloat(
                    ((auctionData?.auction.endDate as any) as string) || ""
                  ) * 1000
                )
              }
            ></Timer>
          ) : (
            "Auction Complete"
          )}
        </div>
      </div>

      <h1>Auction</h1>
      <p>{auctionData?.auction.type}</p>

      <BarDiv>
        <BarSubdiv>
          <TextInput
            placeholder="0.00 ETH"
            style={{ borderRight: isMobile ? "" : "1px solid white" }}
            onChange={(ev) => {
              setEth(parseFloat(ev.target.value));
            }}
          ></TextInput>
        </BarSubdiv>

        <BarArrowSpan action={() => {}}></BarArrowSpan>

        <BarSubdiv>
          <TextInput
            disabled
            style={{
              borderLeft: isMobile ? "" : "1px solid white",
              textAlign: "right",
              height: "100%",
            }}
            value={`${
              auctionData?.auction.price
                ? eth * parseFloat(auctionData.auction.price.toString())
                : "0.00"
            } ${(auctionData?.auction as any)?.token.symbol}`}
          ></TextInput>
        </BarSubdiv>
        <Button
          style={{
            margin: "0",
            borderRadius: "0",
            width: isMobile ? "100%" : "",
          }}
          onClick={() => {
            setModalOpen(true);
          }}
        >
          Purchase
        </Button>
      </BarDiv>

      {auctionData?.auction ? (
        <div>Price: {auctionData.auction.price.toString()}</div>
      ) : (
        "Auction not found"
      )}

      <h3>Purchases</h3>
      <Table
        rowData={auctionData?.auction.purchases || []}
        rowCell={(data) => {
          return [
            data.purchaser,
            ethers.utils.formatEther(data.amount.toString()),
            data.blockNumber.toString(),
          ];
        }}
        rowHeaders={["Address", "Tokens Purchased", "Block Number"]}
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
