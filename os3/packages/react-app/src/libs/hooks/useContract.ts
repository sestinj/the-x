import { JsonRpcSigner } from "@ethersproject/providers";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

function useContract(
  address: string,
  contractInterface: ethers.ContractInterface,
  signer: JsonRpcSigner
) {
  const [contract, setContract] = useState<ethers.Contract | undefined>(
    undefined
  );

  useEffect(() => {
    setContract(new ethers.Contract(address, contractInterface, signer));
  }, [contractInterface, address, signer]);

  return contract;
}

export default useContract;
