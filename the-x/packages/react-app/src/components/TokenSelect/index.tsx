import { ChevronDownIcon } from "@heroicons/react/outline";
import React, { useEffect, useState } from "react";
import { HoverDiv, secondaryDark } from "..";
import Modal from "../Modal";
import SafeImg from "../SafeImg/SafeImg";
import Table from "../Table";
import {
  DEFAULT_TOKEN,
  DEFAULT_TOKEN_LISTS,
  getTokens,
  Token,
} from "./compileTokenLists";

interface TokenSelectProps {
  onChange: (token: Token) => void;
}

const TokenSelect = (props: TokenSelectProps) => {
  const [currentToken, setCurrentToken] = useState<Token>(DEFAULT_TOKEN);
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
          padding: "8px",
          border: "none",
          cursor: "pointer",
          display: "grid",
          gridTemplate: "auto / auto auto auto",
          alignItems: "center",
          columnGap: "10px",
        }}
        onClick={() => {
          setOpen(true);
        }}
      >
        <SafeImg
          address={currentToken.logoURI}
          style={{
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            overflow: "clip",
            gridColumn: "1",
          }}
        ></SafeImg>

        <p style={{ color: "white", gridColumn: "2" }}>{currentToken.symbol}</p>
        <ChevronDownIcon
          width="20px"
          height="20px"
          style={{ gridColumn: "3" }}
          color="white"
        ></ChevronDownIcon>
      </button>

      <Modal
        open={open}
        closeModal={() => {
          setOpen(false);
        }}
      >
        <h3 style={{ marginLeft: "20px" }}>Select Token</h3>
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
                    props.onChange(data);
                    setOpen(false);
                  }}
                >
                  <SafeImg
                    address={data.logoURI}
                    style={{
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      overflow: "clip",
                      gridColumn: "1",
                    }}
                  ></SafeImg>
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
      </Modal>
    </>
  );
};

export default TokenSelect;
