import { ethers } from "ethers";
import React, {
  ReactChild,
  ReactNode,
  Component,
  useState,
  useEffect,
} from "react";

export const isAddress = (addressCandidate: string) => {
  return (
    typeof addressCandidate == "string" &&
    addressCandidate.startsWith("0x") &&
    addressCandidate.length == 42
  );
};

// export const findByType = (children: Component[], typeName: string) => {
//   return children.filter((child) => {
//     return child.displayName === typeName;
//   })
// };

export const useContract = (
  addressOrName: string,
  contractInterface: ethers.ContractInterface,
  signerOrProvider?: ethers.Signer | ethers.providers.Provider | undefined
): ethers.Contract => {
  const [contract, setContract] = useState(
    new ethers.Contract(addressOrName, contractInterface, signerOrProvider)
  );

  useEffect(() => {
    const newContract = new ethers.Contract(
      addressOrName,
      contractInterface,
      signerOrProvider
    );
    setContract(newContract);
  }, [signerOrProvider]);

  return contract;
};

export const isZeroAddress = (address: string): boolean => {
  return address === "0x0000000000000000000000000000000000000000";
};
