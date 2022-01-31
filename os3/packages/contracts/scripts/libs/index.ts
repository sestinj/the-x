export const fullDeployment = async (ethers: any) => {
  const FErc20Dex = await ethers.getContractFactory("FErc20Dex");
  const FEthToErc20Dex = await ethers.getContractFactory("FEthToErc20Dex");
  const FErc20ToEthDex = await ethers.getContractFactory("FErc20ToEthDex");

  const fErc20Dex = await FErc20Dex.deploy();
  const fEthToErc20Dex = await FEthToErc20Dex.deploy();
  const fErc20ToEthDex = await FErc20ToEthDex.deploy();

  await Promise.all([
    fErc20Dex.deployed(),
    fEthToErc20Dex.deployed(),
    fErc20ToEthDex.deployed(),
  ]);

  const CentralDex = await ethers.getContractFactory("CentralDex", {
    libraries: {
      FErc20Dex: fErc20Dex.address,
      FEthToErc20Dex: fEthToErc20Dex.address,
      FErc20ToEthDex: fErc20ToEthDex.address,
    },
  });

  const centralDex = await CentralDex.deploy();
  await centralDex.deployed();
  return centralDex;
};
