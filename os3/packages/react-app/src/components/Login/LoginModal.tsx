import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import {
  SimpleLabel,
  SimpleTextInput,
  SimpleSubmit,
  SimplePasswordInput,
  SimpleCancel,
} from "./components";
import CryptoJS from "crypto-js";
import { ethers } from "ethers";
import crypto from "crypto";
import addresses from "@project/contracts/src/addresses";
import { SignerContext } from "../../App";
import SmartLogin from "@project/contracts/artifacts/src/login/SmartLogin.sol/SmartLogin.json";

const LoginModal = React.forwardRef((props, ref) => {
  const { signer } = useContext(SignerContext);
  const { register, handleSubmit } = useForm();
  const onSubmit = async (data: any) => {
    // Create a new Ethereum address and get secret key
    const secretKey = "0x" + crypto.randomBytes(32).toString("hex");
    const wallet = new ethers.Wallet(secretKey);

    // Encrypt the password
    const encryptedPassword = CryptoJS.AES.encrypt(
      data.password,
      secretKey
    ).toString();
    // Send email, encrypted password to the contract to create new account or login (both will be same action).
    const smartLoginContract = new ethers.Contract(
      addresses.smartLogin,
      SmartLogin.abi,
      signer
    );
    // smartLoginContract.
    // Retrieve response and decide what to do
  };
  const hideModal = () => {
    (ref as any).current.hidden = true; // This is obviously gross...
  };
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "#aaaaaaaa",
        alignContent: "center",
        justifyContent: "center",
        display: "flex",
        padding: "50px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          height: "fit-content",
          padding: "20px",
        }}
      >
        <div>
          <button
            onClick={hideModal}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              float: "right",
              right: "0",
            }}
          >
            <svg width="20px" height="20px">
              <line
                x1="0"
                y1="20"
                x2="20"
                y2="0"
                strokeLinecap="round"
                style={{
                  stroke: "gray",
                  strokeWidth: "4px",
                }}
              ></line>
              <line
                x1="0"
                y1="0"
                x2="20"
                y2="20"
                strokeLinecap="round"
                style={{
                  stroke: "gray",
                  strokeWidth: "4px",
                }}
              ></line>
            </svg>
          </button>
          <h2>Login or Signup</h2>
        </div>
        <hr></hr>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <SimpleLabel htmlFor="email">Email</SimpleLabel>
            <br></br>
            <SimpleTextInput
              id="email"
              {...register("email")}
              placeholder="Email"
            />
            <br></br>
            <SimpleLabel htmlFor="password">Password</SimpleLabel>
            <br></br>
            <SimplePasswordInput
              id="password"
              {...register("password")}
              placeholder="••••••••••••"
            />
            <br></br>
            <br></br>
            <div style={{ display: "grid", columnGap: "10px" }}>
              <SimpleCancel style={{ gridRow: "1" }}>Cancel</SimpleCancel>
              <SimpleSubmit style={{ gridRow: "1" }} value="Log In" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export default LoginModal;
