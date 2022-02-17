import { gql } from "@apollo/client";
import { BigNumber } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { SignerContext } from "../App";
import { PieChart } from "../components/charts/d3";
import Layout from "../components/Layout";
import Table from "../components/Table";
import {
  DEFAULT_TOKEN_LISTS,
  getTokens,
  Token,
} from "../components/TokenSelect/compileTokenLists";
import { getTokenBalance } from "../libs/etherscan";

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
      const user = await signer?.getAddress();
      if (!user) {
        return;
      }
      const tokens = await getTokens(DEFAULT_TOKEN_LISTS);
      const balances = await Promise.all(
        tokens.map(async (token) => {
          const balance = await getTokenBalance(token.address, user);
          return { token, balance };
        })
      );
      setTokenBalances(balances);
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
                <div>{data.balance.toString()}</div>,
              ];
            }}
            rowHeaders={["Token", "Balance"]}
          ></Table>
        </div>
        <div style={{ gridColumn: "2" }}>
          <PieChart
            data={tokenBalances.map((tokenBalance) => {
              return {
                label: tokenBalance.token.symbol,
                value: tokenBalance.balance.toNumber() || 2,
              };
            })}
          ></PieChart>
        </div>
      </div>
    </Layout>
  );
};

export default Portfolio;
