import { gql, useApolloClient, useQuery } from "@apollo/client";
import { BadgeCheckIcon, LockClosedIcon } from "@heroicons/react/solid";
import FixedPriceAuction from "@project/contracts/artifacts/src/auction/FixedPriceAuction.sol/FixedPriceAuction.json";
import { Auction } from "@project/subgraph/generated/schema";
import { ethers } from "ethers";
import React, { useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { ProviderContext, SignerContext } from "../../App";
import {
  Button,
  primaryHighlight,
  Pulse,
  secondaryDark,
  TextInput,
} from "../../components";
import BarDiv, { BarArrowSpan, BarSubdiv } from "../../components/BarDiv";
import { LineChart } from "../../components/charts/d3";
import { baseDiv, mobileFlex, rounded } from "../../components/classes";
import Info from "../../components/Info";
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
      <div
        style={{
          ...mobileFlex(isMobile),
          gap: "40px",
          width: "100%",
          alignItems: "start",
        }}
      >
        <div style={{ width: isMobile ? "100%" : "50%" }}>
          <div
            style={{
              display: "grid",
              gridTemplate: "auto / auto auto",
              alignItems: "center",
            }}
          >
            <div
              style={{
                gridColumn: "1",
              }}
            >
              <img
                style={{
                  borderRadius: "50%",
                  boxShadow: "1px 1px 20px gray",
                  filter: "invert(1)",
                }}
                src="/logo192.png"
                height="100px"
              ></img>
            </div>
            <div style={{ gridColumn: "2" }}>
              <h1>{auctionData?.auction.token.name}</h1>
              <h2>{auctionData?.auction.token.symbol}</h2>
            </div>

            <div
              style={{
                border: auctionData?.auction.open ? "none" : "2px solid gray",
                ...rounded,
                gridColumn: "3",
                display: "flex",
                gap: "10px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {auctionData?.auction.open ? (
                <Pulse>
                  <BadgeCheckIcon
                    width="30px"
                    height="30px"
                    color="white"
                  ></BadgeCheckIcon>
                </Pulse>
              ) : (
                <LockClosedIcon
                  width="30px"
                  height="30px"
                  color="gray"
                ></LockClosedIcon>
              )}

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

          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
            blandit congue tempus. Nam velit velit, ullamcorper quis leo
            ultricies, auctor fringilla nunc. Praesent vitae nulla hendrerit,
            elementum lectus vel, blandit dolor. Pellentesque habitant morbi
            tristique senectus et netus et malesuada fames ac turpis egestas.
            Curabitur euismod nisi eu metus venenatis porttitor. Donec efficitur
            ac tortor et faucibus. Nunc et purus quis lorem laoreet blandit at
            non sapien. Nulla facilisi. Cras metus tellus, tristique eget
            accumsan eget, viverra sed eros. Ut a malesuada dolor, nec tempor
            ante. Integer elementum sodales gravida. In malesuada leo sed felis
            condimentum rutrum. Cras fringilla in elit vitae egestas. Sed
            maximus, justo ac hendrerit volutpat, ante nibh molestie enim, ut
            luctus dui nibh ut augue. Duis eu quam ante. Curabitur molestie
            aliquam ante ac fringilla. Morbi eget lorem in odio tempor vehicula
            id a arcu. Sed cursus faucibus ex sed convallis. Suspendisse vel sem
            in orci facilisis varius et a ligula. Integer sed orci non diam
            molestie dictum vitae sit amet velit. In ullamcorper libero gravida,
            bibendum lorem id, malesuada mauris. Nulla at felis fermentum odio
            facilisis egestas. Interdum et malesuada fames ac ante ipsum primis
            in faucibus. Aenean a nunc eget turpis dignissim dignissim in vitae
            dui. Mauris luctus sollicitudin libero maximus consequat. Ut velit
            mauris, feugiat at mollis sed, accumsan et justo. Phasellus cursus
            felis id neque cursus, a interdum quam vulputate. Sed ac vestibulum
            tellus. Suspendisse bibendum porta nulla non vestibulum. Duis
            euismod pulvinar volutpat. Aliquam pulvinar dictum libero, eu
            tincidunt ex interdum eu. Nulla bibendum massa dolor, eget fringilla
            augue vulputate nec. Suspendisse potenti. Quisque imperdiet auctor
            bibendum. Aenean urna tellus, cursus aliquet fermentum et, fringilla
            a quam. Donec elementum dapibus lectus id fringilla. Aliquam
            ullamcorper orci purus, vitae ullamcorper tellus suscipit eget.
            Fusce id varius massa. Mauris ut urna turpis. Maecenas placerat erat
            neque, vel mollis risus finibus at. Proin rhoncus purus fermentum
            congue vulputate. Maecenas at justo in enim vestibulum faucibus.
          </p>

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
        </div>
        <div
          style={{
            width: isMobile ? "100%" : "50%",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div>
              <div
                style={{
                  backgroundColor: primaryHighlight,
                  ...rounded,
                  padding: "4px",
                  paddingRight: "8px",
                  paddingLeft: "8px",
                  width: "min-content",
                  margin: "4px",
                  display: "flex",
                  gap: "4px",
                  alignItems: "center",
                }}
              >
                {auctionData?.auction.type} Auction
                <Info>
                  Fixed price means that the price of the token is constant and
                  however much is purchased by the end will determine the total
                  supply.
                </Info>
              </div>
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
            </div>
          </div>

          <div
            style={{
              margin: "10px",
              textAlign: "center",
              justifyContent: "center",
              ...mobileFlex(isMobile),
            }}
          >
            <LineChart
              title="Total Auction Volume"
              xLabel="Date"
              yLabel="Total Volume"
              labels={["Total Volume"]}
              width={"100%"}
              height={"50%"}
              x={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
              y={[1, 4, 9, 16, 25, 36, 49, 64, 81]}
            ></LineChart>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuctionPage;
