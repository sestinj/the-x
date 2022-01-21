import { Body, Header } from ".";
import TestBorder from "./TestBorder";
import WalletButton from "./WalletButton";
import React, { useContext, useRef } from "react";
import { SignerContext, ProviderContext } from "../App";
import Logo from "./Logo";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { signer, setSigner } = useContext(SignerContext);
  const provider = useContext(ProviderContext);

  const modalRef = useRef();
  const testBorderRef = useRef<any>(null);

  return (
    <TestBorder provider={provider}>
      {/* <LoginModal ref={modalRef}></LoginModal> */}
      <Header>
        <Logo letter="x"></Logo>
        {/* <LoginButton modalRef={modalRef}></LoginButton> */}
        <WalletButton
          provider={provider}
          setSigner={setSigner}
          signer={signer}
        ></WalletButton>
      </Header>
      <Body>{children}</Body>
    </TestBorder>
  );
};

export default Layout;
