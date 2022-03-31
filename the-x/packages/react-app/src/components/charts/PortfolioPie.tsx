import { ethers } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { SignerContext } from "../../App";
import { getAllTokenBalances } from "../../libs/etherscan";
import { PieChart } from "./d3";

const PortfolioPie = () => {
  const { signer } = useContext(SignerContext);
  const [tokenBalances, setTokenBalances] = useState<any[]>([]);

  useEffect(() => {
    async function getTokenBalances() {
      const balances = await getAllTokenBalances(signer);
      setTokenBalances(balances as any);
    }
    getTokenBalances();
  }, [signer]);
  return (
    <PieChart
      data={tokenBalances.map((tokenBalance) => {
        return {
          label: tokenBalance.token.symbol,
          value:
            parseFloat(ethers.utils.formatEther(tokenBalance.balance)) || 2,
        };
      })}
    ></PieChart>
  );
};

export default PortfolioPie;
