import React from "react";
import { useForm } from "react-hook-form";
import { TextInput } from "../..";
import FormPage from "../FormPage";

const TokenInfo = () => {
  const { register, handleSubmit, watch } = useForm();
  return (
    <FormPage>
      <TextInput
        id="tokenSymbol"
        placeholder="NJS"
        {...register("symbol")}
      ></TextInput>
      <br></br>
      <br></br>
      <label htmlFor="tokenName">Token Name</label>
      <br></br>
      <TextInput
        id="tokenName"
        placeholder="Nate Sesti"
        {...register("name")}
      ></TextInput>
      <br></br>
      <br></br>
      <label htmlFor="personalStake">Personal Stake</label>
      <br></br>
      <TextInput
        id="personalStake"
        placeholder="50%"
        {...register("personalStake")}
      ></TextInput>
      <br></br>
      <br></br>

      <label htmlFor="owner">Your Address</label>
      <br></br>
      <TextInput
        id="owner"
        placeholder="0xABC...123"
        {...register("owner")}
      ></TextInput>
      <br></br>
      <br></br>

      <p>This will give you $X worth of tokens.</p>
    </FormPage>
  );
};

export default TokenInfo;
