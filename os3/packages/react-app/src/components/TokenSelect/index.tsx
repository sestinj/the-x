import React, { Fragment, useEffect, useState } from "react";
import { XIcon } from "@heroicons/react/solid";
import { baseDiv, rounded } from "../classes";
import Table from "../Table";
import { DEFAULT_TOKEN_LISTS, getTokens, Token } from "./compileTokenLists";
import Modal from "../Modal";
import { backgroundColor, HoverDiv, secondaryDark, Select } from "..";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { Dialog, Transition } from "@headlessui/react";

const TokenSelect = () => {
  const [currentToken, setCurrentToken] = useState<Token>({
    name: "Ethereum",
    symbol: "ETH",
    address: "0x0000000000000000000000000000000000000000",
    chainId: 1,
    decimals: 18,
    logoURI: "/logo192.png",
  });
  const [tokens, setTokens] = useState<Token[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadTokens = async () => {
      const tokenList = await getTokens(DEFAULT_TOKEN_LISTS);
      setTokens(tokenList);
    };
    loadTokens();
  }, []);

  return (
    <>
      <button
        style={{
          backgroundColor: secondaryDark,
          ...rounded,
          padding: "8px",
          border: "none",
          cursor: "pointer",
        }}
        onClick={() => {
          setOpen(true);
        }}
      >
        <ChevronDownIcon width="30px" height="30px"></ChevronDownIcon>
      </button>

      <Transition appear show={open} as={Fragment}>
        <Dialog
          as="div"
          style={{
            position: "fixed",
            inset: "0",
            zIndex: "10",
            overflowY: "auto",
          }}
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => {
            setOpen(false);
          }}
        >
          <div
            className="min-h-screen px-4 text-center"
            style={{
              minHeight: "100vh",
              paddingLeft: "4px",
              paddingRight: "4px",
              textAlign: "center",
            }}
          >
            <Dialog.Overlay
              className="fixed inset-0"
              style={{
                position: "fixed",
                inset: "0",
                backgroundColor: "#00000099",
                zIndex: "-1", // TODO
              }}
            />
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              style={{
                display: "inline-block",
                height: "100vh",
                verticalAlign: "middle",
              }}
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div
              className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
              style={{
                display: "inline-block",
                width: "100%",
                maxWidth: "28rem",
                padding: "6px",
                marginTop: "8px",
                marginBottom: "8px",
                overflow: "hidden",
                textAlign: "left",
                verticalAlign: "middle",
                transitionProperty: "all",
                transitionDuration: "150ms",
                transitionTimingFunction: "linear",
                backgroundColor: "white",
                boxShadow: "2px 2px black",
                ...baseDiv,
              }}
            >
              <XIcon
                width="30px"
                height="30px"
                onClick={() => {
                  setOpen(false);
                }}
                style={{ float: "right", cursor: "pointer" }}
              ></XIcon>
              <div
                style={{
                  ...baseDiv,
                  maxHeight: "75vh",
                }}
              >
                <h3>Select Token</h3>
                <div style={{ overflow: "scroll", height: "50vh" }}>
                  <Table
                    style={{ width: "100%" }}
                    rowCell={(data) => {
                      return [
                        <HoverDiv
                          style={{
                            display: "grid",
                            gridTemplate: "auto / auto auto auto",
                            cursor: "pointer",
                            alignItems: "center",
                            paddingLeft: "10px",
                            paddingRight: "10px",
                          }}
                          onClick={() => {
                            setCurrentToken(data);
                            setOpen(false);
                          }}
                        >
                          <img
                            src={data.logoURI}
                            style={{
                              borderRadius: "50%",
                              width: "30px",
                              height: "30px",
                              overflow: "clip",
                              gridColumn: "1",
                            }}
                          ></img>
                          <p style={{ gridColumn: "2 / 3" }}>
                            <b>
                              {data.symbol}
                              {"    "}
                            </b>
                            {data.name}
                          </p>
                        </HoverDiv>,
                      ];
                    }}
                    rowData={tokens}
                  ></Table>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default TokenSelect;
