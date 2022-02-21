import React, { useContext } from "react";
import { Body, Header } from "..";
import { ProviderContext, SignerContext } from "../../App";
import AlertArea from "../AlertArea";
import Logo from "../Logo";
import TestBorder from "../TestBorder";
import WalletButton from "../WalletButton";
import SideBar from "./SideBar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { signer, setSigner } = useContext(SignerContext);
  const { provider, setProvider } = useContext(ProviderContext);

  // const modalRef = useRef();
  // const testBorderRef = useRef<any>(null);

  return (
    <TestBorder networkName={provider?.network?.name}>
      {/* <LoginModal ref={modalRef}></LoginModal> */}
      <Header>
        <Logo letter="x"></Logo>
        {/* <LoginButton modalRef={modalRef}></LoginButton> */}
        <WalletButton
          provider={provider}
          setProvider={setProvider}
          setSigner={setSigner}
          signer={signer}
        ></WalletButton>
      </Header>
      <SideBar></SideBar>
      <Body>
        {children}
        <AlertArea></AlertArea>
      </Body>
    </TestBorder>
  );
};

export default Layout;
