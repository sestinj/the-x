import { Body, Header } from ".";
import WalletButton from "./WalletButton";
import React, { useContext } from "react";
import { SignerContext, ProviderContext } from "../App";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const signerRef = useContext(SignerContext);
  const provider = useContext(ProviderContext);

  return (
    <>
      <Header>
        <WalletButton provider={provider} signerRef={signerRef}></WalletButton>
      </Header>
      <Body>{children}</Body>
    </>
  );
};

export default Layout;
