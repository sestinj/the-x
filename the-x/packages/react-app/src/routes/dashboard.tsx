import CentralDex from "@project/contracts/artifacts/src/dex/CentralDex.sol/CentralDex.json";
import config from "@project/react-app/src/config/index.json";
import { ethers } from "ethers";
import React, { useContext, useEffect } from "react";
import { SignerContext } from "../App";
import PortfolioPie from "../components/charts/PortfolioPie";
import TileGrid from "../components/Dashboard/TileGrid";
import NumberTile from "../components/Dashboard/Tiles/NumberTile";
import Tile from "../components/Dashboard/Tiles/Tile";
import Layout from "../components/Layout";

// Have a concept of tiles (this can also be used on the main user dashboard, and they should be moveable, and thrid parties can make integrations so there is an app store for tiles, just like we talked about at Mayanalytics)
// Like looker
// Most basic tile is just a number
// Tiles have infinite drill-down
// All css-grid based

// You should make a graph entity that stores just basic overall data to be displayed here.

const Dashboard = () => {
  const { signer } = useContext(SignerContext);

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
      <h1>Dashboard</h1>

      <TileGrid>
        <Tile gridRow="1 / 5" gridColumn="1 / 3">
          <div>
            <PortfolioPie></PortfolioPie>
          </div>
        </Tile>
        <NumberTile value={88} gridRow="7" gridColumn="8"></NumberTile>
        <NumberTile
          value={42069}
          gridRow="5 / 6"
          gridColumn="4 / 5"
        ></NumberTile>
      </TileGrid>
    </Layout>
  );
};

export default Dashboard;
