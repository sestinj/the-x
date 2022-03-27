import { EthereumAuthProvider, ThreeIdConnect } from "@3id/connect";
import { getResolver as get3IDResolver } from "@ceramicnetwork/3id-did-resolver";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { DID } from "dids";
import { getResolver as getKeyResolver } from "key-did-resolver";
import { useState } from "react";

function use3IDConnect() {
  const [authenticated, setAuthenticated] = useState(false);
  const [did, setDid] = useState<DID | undefined>(undefined);
  // Create a ThreeIdConnect connect instance as soon as possible in your app to start loading assets
  const threeID = new ThreeIdConnect();

  async function authenticateWithEthereum(ethereumProvider: any) {
    // Request accounts from the Ethereum provider
    const accounts = await ethereumProvider.request({
      method: "eth_requestAccounts",
    });
    // Create an EthereumAuthProvider using the Ethereum provider and requested account
    const authProvider = new EthereumAuthProvider(
      ethereumProvider,
      accounts[0]
    );
    // Connect the created EthereumAuthProvider to the 3ID Connect instance so it can be used to
    // generate the authentication secret
    await threeID.connect(authProvider);

    // Create the Ceramic instance and inject the DID
    const ceramic = new CeramicClient("http://localhost:7007");
    const newDid = new DID({
      // Get the DID provider from the 3ID Connect instance
      provider: threeID.getDidProvider(),
      resolver: {
        ...get3IDResolver(ceramic),
        ...getKeyResolver(),
      },
    });
    // Authenticate the DID using the 3ID provider from 3ID Connect, this will trigger the
    // authentication flow using 3ID Connect and the Ethereum provider
    newDid.authenticate().then(() => {
      setAuthenticated(true);
    });
    setDid(newDid);
    ceramic.did = newDid;

    // Create the model and store
    // const model = new DataModel({ ceramic, model: modelAliases });
    // const store = new DIDDataStore({ ceramic, model });
  }

  // When using extensions such as MetaMask, an Ethereum provider may be injected as `window.ethereum`
  async function tryAuthenticate() {
    if (window.ethereum == null) {
      throw new Error("No injected Ethereum provider");
    }
    await authenticateWithEthereum(window.ethereum);
  }

  tryAuthenticate();

  return { authenticated, did };
}

export default use3IDConnect;
