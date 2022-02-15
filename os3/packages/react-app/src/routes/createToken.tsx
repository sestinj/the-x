import AuctionFactory from "@project/contracts/artifacts/src/auction/AuctionFactory.sol/AuctionFactory.json";
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { SignerContext } from "../App";
import { Button, primaryHighlight, TextInput } from "../components";
import Hr from "../components/Hr";
import Info from "../components/Info";
import Layout from "../components/Layout";
import TxModal from "../components/TxModal";
import config from "../config/index.json";
import { useContract } from "../libs";

const CreateToken = () => {
  const { register, handleSubmit, watch } = useForm();
  const data = watch(); // honestly get your shit together
  const { signer } = useContext(SignerContext);

  const factoryContract = useContract(
    config.addresses.auctionFactory,
    AuctionFactory.abi,
    signer
  );

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Layout>
        <TxModal
          open={modalOpen}
          closeModal={() => {
            setModalOpen(false);
          }}
          args={[
            data.name,
            data.symbol,
            data.price,
            data.owner,
            data.personalStake,
          ]}
          txFunction={factoryContract.createNewAuction}
          options={{ title: "New Auction Created", description: "Description" }}
        >
          Confirm that you want to create a new token.
        </TxModal>

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
          <div
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
            <label htmlFor="personalStake">Personal Stake</label>
            <br></br>
            <TextInput
              id="personalStake"
              placeholder="50%"
              {...register("personalStake")}
            ></TextInput>
            <br></br>
            <br></br>
            <label htmlFor="price">Auction Price</label>
            <Info>
              This is the static price of the token during the auction. Once the
              auction ends, the price of the token will be determined by the
              markets.
            </Info>
            <br></br>
            <TextInput
              id="price"
              placeholder="1.00"
              type="number"
              {...register("price")}
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
            <Button
              onClick={() => {
                console.log("factory address: ", factoryContract.address);
                setModalOpen(true);
              }}
            >
              Create Token
            </Button>
          </div>
          <br></br>
          <div style={{ textAlign: "center" }}>
            <Hr></Hr>
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
