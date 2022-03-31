import { gql } from "@apollo/client";
import { BigNumber } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { SignerContext } from "../App";
import PortfolioPie from "../components/charts/PortfolioPie";
import Layout from "../components/Layout";
import Table from "../components/Table";
import { Token } from "../components/TokenSelect/compileTokenLists";
import { weiToEther } from "../libs";
import { getAllTokenBalances } from "../libs/etherscan";

const GET_USER = gql`
  query getUser($id: ID!) {
    user(id: $id) {
      id
      address
      liquidityPositions {
        id
        pair
        amount
      }
    }
  }
`;

const Portfolio = () => {
  const { signer } = useContext(SignerContext);
  const [tokenBalances, setTokenBalances] = useState<
    { token: Token; balance: BigNumber }[]
  >([]);

  useEffect(() => {
    async function getTokenBalances() {
      const balances = await getAllTokenBalances(signer);
      setTokenBalances(balances as any);
    }
    getTokenBalances();
  }, [signer]);
  return (
    <Layout>
      <h1>Portfolio</h1>
      <div
        style={{
          display: "grid",
          gridTemplate: "auto / auto auto",
          rowGap: "20px",
        }}
      >
        <div style={{ gridColumn: "1" }}>
          <Table
            rowData={tokenBalances}
            rowCell={(data) => {
              return [
                <div>{data.token.symbol}</div>,
                <div>{weiToEther(data.balance)}</div>,
              ];
            }}
            rowHeaders={["Token", "Balance"]}
          ></Table>
        </div>
        <div style={{ gridColumn: "2" }}>
          <PortfolioPie></PortfolioPie>
        </div>
      </div>
    </Layout>
  );
};

export default Portfolio;
