import React, { createContext, useState } from "react";
import { JsonRpcSigner } from "@ethersproject/providers";
import { ethers } from "ethers";
import Config from "./config/index.json";

export const SignerContext: React.Context<{
  signer?: JsonRpcSigner;
  setSigner?: React.Dispatch<React.SetStateAction<JsonRpcSigner | undefined>>;
}> = createContext({});

let provider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(
  Config.alchemyKey
);
if ((window as any).ethereum) {
  provider = new ethers.providers.Web3Provider((window as any).ethereum);
}

export const ProviderContext = createContext(provider);

interface AppProps {
  children: React.ReactNode;
}

const App = ({ children }: AppProps) => {
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>();

  return (
    <>
      <SignerContext.Provider value={{ signer, setSigner }}>
        <ProviderContext.Provider value={provider}>
          {children}
        </ProviderContext.Provider>
      </SignerContext.Provider>
    </>
  );
};

export default App;
