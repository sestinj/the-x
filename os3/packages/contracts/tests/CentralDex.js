const assert = require("chai").assert;

describe("*", () => {
  before(async () => {
    const [owner] = await ethers.getSigners();
  });

  // We must create existing tokens to test functionality.
  // Otherwise you get an opaque revert message.
  var token1;
  var token2;
  describe("ERC20 token contract", () => {
    it("should be constructed without reversion", async () => {
      ERC20Token = await ethers.getContractFactory("ERC20");

      token1 = await ERC20Token.deploy("Token1", "ONE");
      token2 = await ERC20Token.deploy("Token2", "TWO");
    });
  });

  describe("ERC20 DEX contract", () => {
    it("should be contructed without reversion.", async () => {
      const Erc20Dex = await ethers.getContractFactory("Erc20Dex");

      dex = await Erc20Dex.deploy(token1.address, token2.address);
    });
  });

  describe("Central DEX contract", () => {
    var centralDex;
    before(async () => {
      const [owner] = await ethers.getSigners();

      const CentralDex = await ethers.getContractFactory("CentralDex");

      centralDex = await CentralDex.deploy();

      assert.exists(await centralDex.dexAddresses);
    });

    it("should add an exchange between DOGE and SHIB", async () => {
      const tx = await centralDex.createErc20Dex(
        token1.address,
        token2.address
      );
      assert(
        false,
        "How does one get the address that the tx is supposed to send back?"
      );
    });

    it("should send a list of exchanges.", async () => {
      const exchanges = await centralDex.listExchanges();

      console.log(exchanges);
      assert.exists(exchanges);
    });
  });
});
