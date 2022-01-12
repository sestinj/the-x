import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ParamType } from "@ethersproject/abi";
import { BytesLike } from "ethers";

export const createContracts = (
  address: string,
  abi: any,
  signers: SignerWithAddress[]
) => {
  return signers.map((signer) => {
    return new ethers.Contract(address, abi, signer);
  });
};

export const waitForTx = async (tx: any) => {
  return await (await tx).wait();
};

export const decode = (
  types: readonly (string | ParamType)[],
  data: BytesLike
) => {
  return ethers.utils.defaultAbiCoder.decode(types, data);
};

export const isAddress = (addressCandidate: string) => {
  return (
    typeof addressCandidate == "string" &&
    addressCandidate.startsWith("0x") &&
    addressCandidate.length == 42
  );
};
