import React, { useState } from "react";
import styled from "styled-components";
import RopstenAddresses from "./RopstenAddresses.json";

const StyledImg = styled.img`
  &:before {
    content: "";
  }
`;

interface SafeImgProps {
  address: string;
  style: any;
}

const SafeImg = (props: SafeImgProps) => {
  const [exists, setExists] = useState(true);
  const [address, setAddress] = useState(props.address);

  return (
    <>
      <StyledImg
        style={{ filter: exists ? "none" : "invert(1)", ...props.style }}
        src={exists ? address : "logo512.png"}
        onError={() => {
          if (props.address === address) {
            if ((RopstenAddresses as any)[props.address]) {
              setAddress((RopstenAddresses as any)[props.address]);
              return;
            }
          }
          setExists(false);
        }}
      />
    </>
  );
};

export default SafeImg;
