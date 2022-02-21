import { gql, useQuery } from "@apollo/client";
import { ArrowRightIcon } from "@heroicons/react/outline";
import ADex from "@project/contracts/artifacts/src/dex/ADex.sol/ADex.json";
import CentralDex from "@project/contracts/artifacts/src/dex/CentralDex.sol/CentralDex.json";
import config from "@project/react-app/src/config/index.json";
import { LiquidityPosition, Pair } from "@project/subgraph/generated/schema";
import { BigNumber, ethers } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { SignerContext } from "../App";
import { Button, secondaryDark, TextInput } from "../components";
import BarDiv, { BarArrowSpan, BarSubdiv } from "../components/BarDiv";
import { baseDiv } from "../components/classes";
import Info from "../components/Info";
import Layout from "../components/Layout";
import SafeImg from "../components/SafeImg/SafeImg";
import Spinner from "../components/Spinner";
import Table from "../components/Table";
import TxModal from "../components/TxModal";
import { validateTokenAmount, weiToEther } from "../libs";
import useMobileMediaQuery from "../libs/hooks/useMobileMediaQuery";

// TODO - instead of writing the components twice for add and remove, just use the CSS order property, which works in a flex container

const GET_PAIRS = gql`
  query getPairs {
    pairs {
      id
      volume
      tvl
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

const GET_USER_PAIRS = gql`
  query getUserPairs($id: ID!) {
    user(id: $id) {
      id
      liquidityPositions {
        id
        amount
        pair {
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
        }
      }
    }
  }
`;

const Pools = () => {
  const { signer } = useContext(SignerContext);
  const [signerAddress, setSignerAddress] = useState("");

  const isMobile = useMobileMediaQuery();

  const { data: pairData } = useQuery<{ pairs: Pair[] }>(GET_PAIRS);
  const { data: userPositionsData } = useQuery<{
    liquidityPositions: (LiquidityPosition & { pair: Pair })[];
  }>(GET_USER_PAIRS, {
    variables: { id: signerAddress },
  });
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
    async function gsa() {
      if (!signer) {
        return;
      }
      const sa = await signer.getAddress();
      setSignerAddress(sa);
    }
    gsa();
  }, [signer]);

  const {
    formState: { errors: addErrors },
    getValues: addGetValues,
    register: addRegister,
    setValue: addSetValue,
    watch: addWatch,
    handleSubmit: addHandleSubmit,
  } = useForm();

  const {
    formState: { errors: removeErrors },
    getValues: removeGetValues,
    register: removeRegister,
    setValue: removeSetValue,
    watch: removeWatch,
    handleSubmit: removeHandleSubmit,
  } = useForm();
  const removeData = removeWatch();
  const addData = addWatch();

  const [adding, setAdding] = useState(true);

  const [currentPairContract, setCurrentPairContract] = useState<
    ethers.Contract | undefined
  >(undefined);

  useEffect(() => {
    if (!currentPair) {
      return;
    }
    setCurrentPairContract(
      new ethers.Contract(currentPair.address, ADex.abi, signer)
    );
  }, [currentPair, signer]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);

  return (
    <Layout>
      <div style={{ display: "flex" }}>
        <h1>Pools</h1>
        <Info>
          Pools are the exchange's source of tokens. By investing your tokens in
          a pool, you can earn fees on trades within that pair.
        </Info>
      </div>

      <TxModal
        open={addModalOpen}
        closeModal={() => {
          setAddModalOpen(false);
        }}
        args={[addData.quantity1, addData.quantity2]}
        txFunction={currentPairContract?.addLiquidity}
        options={{
          title: "Add Liquidity",
          description: `Added ${addData.quantity1} ${
            (currentPair?.token1 as any)?.symbol
          } and ${addData.quantity2} ${
            (currentPair?.token2 as any)?.symbol
          } to pool.`,
        }}
        requirements={[
          {
            address: (currentPair?.token1 as any)?.address,
            amount: addData.quantity1,
          },
          {
            address: (currentPair?.token2 as any)?.address,
            amount: addData.quantity2,
          },
        ]}
        spender={currentPairContract?.address}
      >
        Confirm that you would like to add liquidity.
      </TxModal>

      <TxModal
        open={removeModalOpen}
        closeModal={() => {
          setRemoveModalOpen(false);
        }}
        args={[removeData.n]}
        txFunction={currentPairContract?.removeLiquidity}
        options={{
          title: "Remove Liquidity",
          description: `Removed ${removeData.quantity1} ${
            (currentPair?.token1 as any)?.symbol
          } and ${removeData.quantity2} ${
            (currentPair?.token2 as any)?.symbol
          } from pool.`,
        }}
      >
        Confirm that you would like to remove liquidity.
      </TxModal>

      {currentPair && (
        <div>
          Selected Pool: {(currentPair.token1 as any)?.symbol}
          {" / "}
          {(currentPair.token2 as any)?.symbol}
          {!adding ? (
            <BarDiv>
              <BarSubdiv>
                <TextInput
                  style={{
                    borderRight: isMobile ? "" : "1px solid white",
                    borderLeft: isMobile ? "" : "1px solid black",
                  }}
                  {...removeRegister("n", {
                    validate: validateTokenAmount,
                    onChange: (ev) => {
                      // const [n, quantity1, quantity2] = addGetValues(["n", "quantity1", "quantity2"]);
                      // addSetValue("quantity1", 69);
                    },
                  })}
                  placeholder={"0.00 Liquidity Token"}
                ></TextInput>
              </BarSubdiv>
              <BarArrowSpan
                action={() => {
                  setAdding(!adding);
                }}
              ></BarArrowSpan>

              <BarSubdiv>
                <TextInput
                  style={{
                    borderLeft: isMobile ? "" : "1px solid white",
                    borderRight: isMobile ? "" : "1px solid black",
                    textAlign: "right",
                  }}
                  placeholder={"0.00 " + (currentPair.token1 as any)?.symbol}
                  {...removeRegister("quantity1", {
                    validate: validateTokenAmount,
                  })}
                ></TextInput>
              </BarSubdiv>
              <BarSubdiv>
                <TextInput
                  style={{
                    textAlign: "right",
                  }}
                  placeholder={"0.00 " + (currentPair.token2 as any)?.symbol}
                  {...removeRegister("quantity2", {
                    validate: validateTokenAmount,
                  })}
                ></TextInput>
              </BarSubdiv>
              {/* Don't use UIntInput! Use just a validation callback with react-hook-forms. then you have a standard UI for textinput errors. */}
              <Button
                style={{
                  borderRadius: "0",
                  margin: "0",
                  height: "100%",
                  width: isMobile ? "100%" : "",
                }}
                onClick={() => {
                  setRemoveModalOpen(true);
                }}
              >
                Remove Liquidity
              </Button>
            </BarDiv>
          ) : (
            <BarDiv>
              <BarSubdiv>
                <TextInput
                  style={{
                    borderRight: isMobile ? "" : "1px solid black",
                  }}
                  placeholder={"0.00 " + (currentPair.token1 as any)?.symbol}
                  {...addRegister("quantity1", {
                    validate: validateTokenAmount,
                  })}
                ></TextInput>
              </BarSubdiv>
              <BarSubdiv>
                <TextInput
                  style={{
                    borderRight: isMobile ? "" : "1px solid white",
                  }}
                  placeholder={"0.00 " + (currentPair.token2 as any)?.symbol}
                  {...addRegister("quantity2", {
                    validate: validateTokenAmount,
                  })}
                ></TextInput>
              </BarSubdiv>
              <BarArrowSpan
                action={() => {
                  setAdding(!adding);
                }}
              ></BarArrowSpan>
              <BarSubdiv>
                <TextInput
                  style={{
                    borderLeft: isMobile ? "" : "1px solid white",
                    textAlign: "right",
                  }}
                  {...addRegister("n", { validate: validateTokenAmount })}
                  placeholder={"0.00 Liquidity Token"}
                ></TextInput>
              </BarSubdiv>
              <Button
                style={{
                  borderRadius: "0",
                  margin: "0",
                  height: "100%",
                  width: isMobile ? "100%" : "",
                }}
                onClick={() => {
                  setAddModalOpen(true);
                }}
              >
                Add Liquidity
              </Button>
            </BarDiv>
          )}
        </div>
      )}

      {userPositionsData?.liquidityPositions?.length && <h3>My Liquidity</h3>}
      {userPositionsData?.liquidityPositions?.length ? (
        <Table
          rowCell={(position: LiquidityPosition & { pair: Pair }) => {
            return [
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  ...baseDiv,
                  backgroundColor: secondaryDark,
                }}
                onClick={() => {
                  setCurrentPair(position.pair);
                }}
              >
                <SafeImg
                  // address={currentToken.logoURI}
                  address="/logo192.png"
                  style={{
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    overflow: "clip",
                    gridColumn: "1",
                    filter: "invert(1)",
                  }}
                ></SafeImg>
                {(position.pair.token1 as any)?.symbol}
                {" / "}
                {(position.pair.token2 as any)?.symbol}
                <SafeImg
                  // address={currentToken.logoURI}
                  address="/logo192.png"
                  style={{
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    overflow: "clip",
                    gridColumn: "1",
                    filter: "invert(1)",
                  }}
                ></SafeImg>
              </div>,
            ];
          }}
          rowData={userPositionsData?.liquidityPositions || []}
        ></Table>
      ) : (
        !currentPair &&
        "Choose a pair below to invest in your first liquidity pool!"
      )}
      <h3>All Pools</h3>
      {pairData ? (
        <Table
          style={{ backgroundColor: secondaryDark }}
          rowStyle={{
            cursor: "pointer",
            ...baseDiv,
          }}
          rowAction={(data) => {
            setCurrentPair(data);
          }}
          cellStyle={{ padding: "20px" }}
          rowCell={(pair: Pair) => {
            return [
              <div style={{ display: "flex", alignItems: "center" }}>
                <SafeImg
                  // address={currentToken.logoURI}
                  address="/logo192.png"
                  style={{
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    overflow: "clip",
                    gridColumn: "1",
                    filter: "invert(1)",
                  }}
                ></SafeImg>
                {(pair.token1 as any)?.symbol}
                {" / "}
                {(pair.token2 as any)?.symbol}
                <SafeImg
                  // address={currentToken.logoURI}
                  address="/logo192.png"
                  style={{
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    overflow: "clip",
                    gridColumn: "1",
                    filter: "invert(1)",
                  }}
                ></SafeImg>
              </div>,
              weiToEther(BigNumber.from(pair.volume.toString())) +
                ` ${(pair.token2 as any)?.symbol}`,
              weiToEther(BigNumber.from(pair.tvl.toString())) +
                ` ${(pair.token2 as any)?.symbol}`,
              <Link to="/exchange">
                <ArrowRightIcon
                  width="30px"
                  height="30px"
                  color="white"
                ></ArrowRightIcon>
              </Link>,
            ];
          }}
          rowHeaders={["Pair", "Volume", "TVL", "Exchange"]}
          rowData={pairData?.pairs || []}
        ></Table>
      ) : (
        <Spinner></Spinner>
      )}
    </Layout>
  );
};

export default Pools;
