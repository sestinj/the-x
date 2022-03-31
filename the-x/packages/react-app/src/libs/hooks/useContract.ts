import { JsonRpcSigner } from "@ethersproject/providers";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

function useContract(
  address: string,
  contractInterface: ethers.ContractInterface,
  signer: JsonRpcSigner | undefined
) {
  const [contract, setContract] = useState<ethers.Contract | undefined>(
    undefined
  );

  useEffect(() => {
    if (!address || !signer) {
      return;
    }
    setContract(new ethers.Contract(address, contractInterface, signer));
  }, [contractInterface, address, signer]);

  return contract;
}

export default useContract;
