import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import IcoFactory from "@project/contracts/artifacts/src/Token/TokenFactory.sol/TokenFactory.json";
import { ethers } from "ethers";
import addresses from "@project/contracts/src/addresses";
import { SignerContext } from "../App";
import { Submit, TextInput } from "../components";
import Layout from "../components/Layout";
import { primaryHighlight } from "../components";

const CreateToken = () => {
  const { register, handleSubmit } = useForm();
  const { signer } = useContext(SignerContext);

  const onSubmit = async (data: any) => {
    const icoFactoryContract = new ethers.Contract(
      addresses.icoFactory,
      IcoFactory.abi,
      signer
    );
    const tx = await icoFactoryContract.createNewIco(
      data.name,
      data.symbol,
      data.icoPrice,
      data.owner,
      data.personalStake
    );
    console.log(tx.toString());
  };

  return (
    <>
      <Layout>
        <h1
          style={{
            marginBottom: "-20px",
          }}
        >
          {/* Your Personal IPO */}
          Bet On Yourself
        </h1>
        <h6>Cash Out on Your Potential, Kickstart Your Career</h6>

        <div style={{ paddingLeft: "10%", paddingRight: "10%" }}>
          <form
            style={{
              border: "2px solid white",
              borderRadius: "8px",
              overflow: "clip",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              boxShadow: `0px 0px 8px 8px ${primaryHighlight}`,
              padding: "20px",
              margin: "auto",
              width: "50%",
            }}
            onSubmit={handleSubmit(onSubmit)}
          >
            <label htmlFor="tokenSymbol">Token Symbol</label>
            <br></br>
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
            <label htmlFor="initialVolume">Initial Volume</label>
            <br></br>
            <TextInput
              id="initialVolume"
              type="number"
              placeholder="1,000,000"
              {...register("initialVolume")}
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
            <label htmlFor="tokenPrice">Token Price</label>
            <br></br>
            <TextInput
              id="tokenPrice"
              placeholder="1.00"
              type="number"
              {...register("tokenPrice")}
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
            <Submit />
          </form>
          <br></br>
          <div style={{ textAlign: "center" }}>
            <svg height="42" width="800">
              <polygon
                points="400,40 420,20 400,0 380,20"
                style={{ stroke: "white", strokeWidth: "1" }}
              ></polygon>
              <polygon
                points="400,30 410,20 400,10 390,20"
                style={{
                  stroke: "white",
                  strokeWidth: "1",
                  fill: "transparent",
                }}
              ></polygon>
              <line
                x1="420"
                y1="20"
                x2="800"
                y2="20"
                style={{ stroke: "white", strokeWidth: "1" }}
              ></line>
              <line
                x1="380"
                y1="20"
                x2="0"
                y2="20"
                style={{ stroke: "white", strokeWidth: "1" }}
              ></line>
            </svg>
            <p>
              A successful token launch takes a lot more than just a smart
              contract—it takes attention and experience planning. If you'd like
              help maximizing your IPO, contact us for help. IPOs assisted by
              our experts make on average X% more.
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default CreateToken;
