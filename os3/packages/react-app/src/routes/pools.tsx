import { gql, useQuery } from "@apollo/client";
import ADex from "@project/contracts/artifacts/src/dex/ADex.sol/ADex.json";
import CentralDex from "@project/contracts/artifacts/src/dex/CentralDex.sol/CentralDex.json";
import config from "@project/react-app/src/config/index.json";
import { Pair } from "@project/subgraph/generated/schema";
import { ethers } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SignerContext } from "../App";
import { Button, secondaryDark, TextInput } from "../components";
import { baseDiv } from "../components/classes";
import Layout from "../components/Layout";
import SafeImg from "../components/SafeImg/SafeImg";
import Table from "../components/Table";
import TxModal from "../components/TxModal";
import { validateTokenAmount } from "../libs";

// TODO - instead of writing the components twice for add and remove, just use the CSS order property, which works in a flex container

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

  const { data: pairData } = useQuery<{ pairs: Pair[] }>(GET_PAIRS);
  const { data: userPairsData } = useQuery<{ pairs: Pair[] }>(GET_USER_PAIRS, {
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
      <h1>Pools</h1>

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
            <div
              style={{
                border: "2px solid white",
                borderRadius: "8px",
                overflow: "clip",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50px",
              }}
            >
              <TextInput
                style={{
                  borderRight: "1px solid white",
                  borderLeft: "1px solid black",
                  height: "100%",
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
              <span
                style={{
                  width: "0px",
                  display: "inline-block",
                  overflow: "visible",
                  position: "relative",
                  zIndex: "10",
                  left: "-12px",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setAdding(!adding);
                }}
              >
                ➡️
              </span>
              <TextInput
                style={{
                  borderLeft: "1px solid white",
                  borderRight: "1px solid black",
                  textAlign: "right",
                  height: "100%",
                }}
                placeholder={"0.00 " + (currentPair.token1 as any)?.symbol}
                {...removeRegister("quantity1", {
                  validate: validateTokenAmount,
                })}
              ></TextInput>
              <TextInput
                style={{
                  textAlign: "right",
                  height: "100%",
                }}
                placeholder={"0.00 " + (currentPair.token2 as any)?.symbol}
                {...removeRegister("quantity2", {
                  validate: validateTokenAmount,
                })}
              ></TextInput>
              {/* Don't use UIntInput! Use just a validation callback with react-hook-forms. then you have a standard UI for textinput errors. */}
              <Button
                style={{ borderRadius: "0", margin: "0", height: "100%" }}
                onClick={() => {
                  setRemoveModalOpen(true);
                }}
              >
                Remove Liquidity
              </Button>
            </div>
          ) : (
            <div
              style={{
                border: "2px solid white",
                borderRadius: "8px",
                overflow: "clip",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50px",
              }}
            >
              <TextInput
                style={{
                  borderRight: "1px solid black",
                  height: "100%",
                }}
                placeholder={"0.00 " + (currentPair.token1 as any)?.symbol}
                {...addRegister("quantity1", {
                  validate: validateTokenAmount,
                })}
              ></TextInput>
              <TextInput
                style={{
                  borderRight: "1px solid white",
                  height: "100%",
                }}
                placeholder={"0.00 " + (currentPair.token2 as any)?.symbol}
                {...addRegister("quantity2", {
                  validate: validateTokenAmount,
                })}
              ></TextInput>
              <span
                style={{
                  width: "0px",
                  display: "inline-block",
                  overflow: "visible",
                  position: "relative",
                  zIndex: "10",
                  left: "-12px",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setAdding(!adding);
                }}
              >
                ➡️
              </span>
              <TextInput
                style={{
                  borderLeft: "1px solid white",
                  height: "100%",
                  textAlign: "right",
                }}
                {...addRegister("n", { validate: validateTokenAmount })}
                placeholder={"0.00 Liquidity Token"}
              ></TextInput>
              <Button
                style={{ borderRadius: "0", margin: "0", height: "100%" }}
                onClick={() => {
                  setAddModalOpen(true);
                }}
              >
                Add Liquidity
              </Button>
            </div>
          )}
        </div>
      )}

      <h3>My Liquidity</h3>
      {/* {userPairsData ? <Table></Table> : "Choose a pair below to invest in your first liquidity pool!"} */}
      <h3>All Pools</h3>
      <Table
        rowCell={(pair: Pair) => {
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
                setCurrentPair(pair);
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
          ];
        }}
        rowData={pairData?.pairs || []}
      ></Table>
    </Layout>
  );
};

export default Pools;
