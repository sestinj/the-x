import { Body, Header } from ".";
import WalletButton from "./WalletButton";
import React, { useContext, useRef } from "react";
import { SignerContext, ProviderContext } from "../App";
import LoginButton from "./Login/LoginButton";
import LoginModal from "./Login/LoginModal";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { signer, setSigner } = useContext(SignerContext);
  const provider = useContext(ProviderContext);

  const modalRef = useRef();

  return (
    <>
      {/* <LoginModal ref={modalRef}></LoginModal> */}
      <Header>
        <LoginButton modalRef={modalRef}></LoginButton>
        <WalletButton
          provider={provider}
          setSigner={setSigner}
          signer={signer}
        ></WalletButton>
      </Header>
      <Body>{children}</Body>
    </>
  );
};

export default Layout;
