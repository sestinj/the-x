import { EthereumAuthProvider, ThreeIdConnect } from "@3id/connect";
import { getResolver as get3IDResolver } from "@ceramicnetwork/3id-did-resolver";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { DataModel } from "@glazed/datamodel";
// import { DIDDataStore } from "@glazed/did-datastore";
import { DID } from "dids";
import { getResolver as getKeyResolver } from "key-did-resolver";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, TextInput } from "../components";
import Layout from "../components/Layout";
import Table from "../components/Table";
import modelAliases from "../libs/ceramic/model.json";

// Create a ThreeIdConnect connect instance as soon as possible in your app to start loading assets
const threeID = new ThreeIdConnect();

async function authenticateWithEthereum(ethereumProvider: any) {
  // Request accounts from the Ethereum provider
  const accounts = await ethereumProvider.request({
    method: "eth_requestAccounts",
  });
  // Create an EthereumAuthProvider using the Ethereum provider and requested account
  const authProvider = new EthereumAuthProvider(ethereumProvider, accounts[0]);
  // Connect the created EthereumAuthProvider to the 3ID Connect instance so it can be used to
  // generate the authentication secret
  await threeID.connect(authProvider);

  const ceramic = new CeramicClient();
  const did = new DID({
    // Get the DID provider from the 3ID Connect instance
    provider: threeID.getDidProvider(),
    resolver: {
      ...get3IDResolver(ceramic),
      ...getKeyResolver(),
    },
  });

  // Authenticate the DID using the 3ID provider from 3ID Connect, this will trigger the
  // authentication flow using 3ID Connect and the Ethereum provider
  await did.authenticate();

  // The Ceramic client can create and update streams using the authenticated DID
  ceramic.did = did;
  console.log("DID AUTHENTICATED: ", did);

  const model = new DataModel({ ceramic, model: modelAliases });
  //   const store = new DIDDataStore({ ceramic, model });
}

// When using extensions such as MetaMask, an Ethereum provider may be injected as `window.ethereum`
async function tryAuthenticate() {
  console.log("Attempting to authenticate...");
  if (window.ethereum == null) {
    throw new Error("No injected Ethereum provider");
  }
  await authenticateWithEthereum(window.ethereum);
}

const Ceramic = () => {
  useEffect(() => {
    tryAuthenticate();
  });

  //   const { model, store } = useCeramic(keys.DID_KEY);
  const { register, handleSubmit } = useForm();

  function updateProfile(data: any) {
    console.log("Updating: ", data);
  }

  return (
    <Layout>
      <div>
        <p>Your DID: {}</p>
        <h3>Profile</h3>
        <TextInput
          placeholder="First Name"
          {...register("firstName")}
        ></TextInput>
        <TextInput
          placeholder="Last Name"
          {...register("lastName")}
        ></TextInput>
        <TextInput
          placeholder="Favorite Number"
          {...register("favoriteNumber")}
          type="number"
        ></TextInput>
        <Button onClick={handleSubmit(updateProfile)}>Update</Button>
      </div>
      <div>
        <h3>Permissions</h3>
        <Table
          rowCell={(data) => {
            return [<div>{JSON.stringify(data)}</div>];
          }}
          rowData={["a", "b", "c"]}
        ></Table>
      </div>
      {/*  abc
      Basic personal profile data
      Proof of uniqueness, biometrics, KYC, etc...
      List of ceramic data tied to your IDX, permissions
      Friends network
      Pinned URLs, media, blog post
      View someone else's data if you're allowed.
      Generate a DID to go with your Ethereum Address
      
      */}
    </Layout>
  );
};

export default Ceramic;
