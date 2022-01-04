import React, { MutableRefObject, useRef, createContext } from "react";
import { JsonRpcSigner } from "@ethersproject/providers";
import { ethers } from "ethers";

export const SignerContext: React.Context<
  any | MutableRefObject<JsonRpcSigner | undefined>
> = createContext(undefined);

const provider = new ethers.providers.Web3Provider(window.ethereum);

export const ProviderContext = createContext(provider);

const App = () => {
  const signerRef: MutableRefObject<JsonRpcSigner | undefined> = useRef();

  return (
    <>
      <SignerContext.Provider value={signerRef}>
        <ProviderContext.Provider value={provider}></ProviderContext.Provider>
      </SignerContext.Provider>
    </>
  );
};

export default App;
