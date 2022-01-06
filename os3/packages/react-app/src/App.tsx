import React, {
  MutableRefObject,
  useRef,
  createContext,
  useState,
} from "react";
import { JsonRpcSigner } from "@ethersproject/providers";
import { ethers } from "ethers";

export const SignerContext: React.Context<{
  signer?: JsonRpcSigner;
  setSigner?: React.Dispatch<React.SetStateAction<JsonRpcSigner | undefined>>;
}> = createContext({});

const provider = new ethers.providers.Web3Provider(window.ethereum);

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
