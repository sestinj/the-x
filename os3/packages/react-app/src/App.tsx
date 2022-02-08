import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers";
import { ethers } from "ethers";
import React, { createContext, useState } from "react";
import Config from "./config/index.json";

export const SignerContext: React.Context<{
  signer?: JsonRpcSigner;
  setSigner?: React.Dispatch<React.SetStateAction<JsonRpcSigner | undefined>>;
}> = createContext({});

let initialProvider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(
  Config.alchemyKey
);
if ((window as any).ethereum) {
  initialProvider = new ethers.providers.Web3Provider((window as any).ethereum);
}

export const ProviderContext: React.Context<{
  provider: JsonRpcProvider;
  setProvider?: React.Dispatch<React.SetStateAction<JsonRpcProvider>>;
}> = createContext({ provider: initialProvider });

interface AppProps {
  children: React.ReactNode;
}

const App = ({ children }: AppProps) => {
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>();
  const [provider, setProvider] = useState<JsonRpcProvider>(initialProvider);

  return (
    <>
      <SignerContext.Provider value={{ signer, setSigner }}>
        <ProviderContext.Provider value={{ provider, setProvider }}>
          {children}
        </ProviderContext.Provider>
      </SignerContext.Provider>
    </>
  );
};

export default App;
