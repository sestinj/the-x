import React from "react";
import { useForm } from "react-hook-form";
import { Select, TextInput } from "../..";
import Info from "../../Info";
import FormPage from "../FormPage";

const Auction = () => {
  const { register, watch } = useForm();
  const auctionType = watch("auctionType");
  return (
    <FormPage>
      <Select {...register("auctionType")}>
        {["Fixed Price", "Fixed Supply", "Dutch Auction"].map((auctionType) => {
          return <option value={auctionType}>{auctionType}</option>;
        })}
      </Select>
      <h3>{auctionType}</h3>
      {auctionType === "Fixed Price" ? (
        <div>
          <div style={{ display: "flex" }}>
            <label htmlFor="price">Auction Price</label>
            <Info style={{ marginLeft: "10px" }}>
              This is the static price of the token during the auction. Once the
              auction ends, the price of the token will be determined by the
              markets.
            </Info>
          </div>
          <TextInput
            id="price"
            placeholder="Token Price"
            type="number"
            {...register("price")}
          ></TextInput>
        </div>
      ) : (
        "This type of auction isn't supported yet."
      )}
    </FormPage>
  );
};

export default Auction;
