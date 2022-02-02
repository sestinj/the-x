import React, { useContext, useEffect, useState } from "react";
import { TextInput, primaryHighlight } from "../components";
import Layout from "../components/Layout";
import { useForm } from "react-hook-form";
import { SignerContext } from "../App";
import { BigNumber, ethers } from "ethers";
import config from "@project/react-app/src/config/index.json";
import CentralDex from "@project/contracts/artifacts/src/dex/CentralDex.sol/CentralDex.json";
import PayableButton from "../components/PayableButton";
import Hr from "../components/Hr";
import { gql, useQuery } from "@apollo/client";
import Table from "../components/Table";
import { Pair } from "@project/subgraph/generated/schema";

const GET_PAIRS = gql`
  query getPairs {
    pairs {
      id
      token1 {
        id
        address
        name
        symbol
      }
      token2 {
        id
        address
        name
        symbol
      }
      address
      price
    }
  }
`;

const Pools = () => {
  const { signer } = useContext(SignerContext);

  const { data: pairData } = useQuery<{ pairs: Pair[] }>(GET_PAIRS);
  const [currentPair, setCurrentPair] = useState<Pair | undefined>();
  // Main Exchange Contract
  var mainExchange = new ethers.Contract(
    config.addresses.centralDex,
    CentralDex.abi,
    signer
  );

  useEffect(() => {
    mainExchange = new ethers.Contract(
      config.addresses.centralDex,
      CentralDex.abi,
      signer
    );
  }, [signer]);

  return (
    <Layout>
      <h1>Pools</h1>
      {currentPair && <div>Selected Pool: {currentPair.id}</div>}
      <Table
        rowCell={(pair: Pair) => {
          return [
            <div
              onClick={() => {
                setCurrentPair(pair);
              }}
            >
              {pair.token1} {"<->"} {pair.token2}
            </div>,
          ];
        }}
        rowData={pairData?.pairs || []}
      ></Table>
    </Layout>
  );
};

export default Pools;
