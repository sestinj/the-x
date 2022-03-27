import { CeramicClient } from "@ceramicnetwork/http-client";
// import { DataModel } from "@glazed/datamodel";
// import { DIDDataStore } from "@glazed/did-datastore";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { useState } from "react";
import { fromString } from "uint8arrays";

function useCeramic(didKey: string | undefined) {
  const [authenticated, setAuthenticated] = useState(false);

  // The key must be provided as an environment variable
  let key = fromString((didKey || process.env.DID_KEY) as string, "base16");
  // Create and authenticate the DID
  const did = new DID({
    provider: new Ed25519Provider(key),
    resolver: getResolver(),
  });
  did.authenticate().then(() => {
    setAuthenticated(true);
  });

  // Create the Ceramic instance and inject the DID
  const ceramic = new CeramicClient("http://localhost:7007");
  ceramic.did = did;

  // Create the model and store
  //   const model = new DataModel({ ceramic, model: modelAliases });
  //   const store = new DIDDataStore({ ceramic, model });

  return { authenticated };
}

export default useCeramic;
