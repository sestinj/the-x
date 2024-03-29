import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { NewPair as NewPairEvent } from "../../generated/CentralDex/CentralDex";
import { DailyStats, HourlyStats, Pair, Token } from "../../generated/schema";
import { Erc20Dex } from "../../generated/templates";
import { ERC20 as ERC20Contract } from "../../generated/templates/ERC20/ERC20";

export function handleNewPair(event: NewPairEvent): void {
  let address1 = event.params.token1;
  let address2 = event.params.token2;
  let pair = new Pair(address1.toHex() + address2.toHex());
  pair.token1 = address1.toHex();
  pair.token2 = address2.toHex();
  pair.address = event.params.dexAddress.toHex();
  pair.price = BigDecimal.fromString("1"); // This isn't accurate, but you have to set it to something and pretty sure this won't have consequences
  pair.volume = BigInt.fromString("0");
  pair.tvl = BigInt.fromString("0");
  pair.swaps = [];

  let lastHourStats = new HourlyStats(
    event.block.timestamp.div(BigInt.fromI32(60 * 60 * 24)).toString()
  );
  lastHourStats.hour = event.block.timestamp.div(BigInt.fromI32(60 * 60 * 24));
  lastHourStats.price = BigDecimal.fromString("1");
  lastHourStats.save();

  let lastDailyStats = new DailyStats(
    event.block.timestamp.div(BigInt.fromI32(60 * 60)).toString()
  );
  lastDailyStats.day = event.block.timestamp.div(BigInt.fromI32(60 * 60));
  lastDailyStats.price = BigDecimal.fromString("1");
  lastDailyStats.save();

  pair.dailyStats = [lastDailyStats.id];
  pair.hourlyStats = [lastHourStats.id];
  pair.lastHourlyStats = lastHourStats.id;
  pair.lastDailyStats = lastDailyStats.id;
  pair.save();

  let token1 = new Token(address1.toHex());
  if (address1.toHex() == "0x0000000000000000000000000000000000000000") {
    token1.name = "Ethereum";
    token1.symbol = "ETH";
  } else {
    let token1Contract = ERC20Contract.bind(address1);
    token1.name = token1Contract.name();
    token1.symbol = token1Contract.symbol();
  }
  token1.address = address1.toHex();
  token1.pairs1 = [pair.id];
  token1.pairs2 = [];
  token1.save();

  let token2 = new Token(address2.toHex());
  if (address2.toHex() == "0x0000000000000000000000000000000000000000") {
    token2.name = "Ethereum";
    token2.symbol = "ETH";
  } else {
    let token2Contract = ERC20Contract.bind(address2);
    token2.name = token2Contract.name();
    token2.symbol = token2Contract.symbol();
  }
  token2.address = address2.toHex();
  token2.pairs1 = [pair.id];
  token2.pairs2 = [];
  token2.save();

  Erc20Dex.create(event.params.dexAddress);
}

// Events need a handler. And this handler should add an entity with its addX function. They are distinct things, but confusingly the same in this case because there is only one event per entity, when the exchange is first created.

// What's the difference between pair.save() and addPair though? Might be the same. addX is only needed when coming from an event handler for something else.

// import { Token } from "../types/schema";

// export function addToken(address: string): void {
//   let token = Token.load(address);
//   if (token != null) {
//     return;
//   }

//   token = new Token(address);
//   if (address == "0xc1c0472c0c80bccdc7f5d01a376bd97a734b8815") {
//     token.decimals = 18;
//     token.name = "CeaErc20";
//     token.symbol = "CEAERC20";
//   } else {
//     token.decimals = 0;
//     token.name = null;
//     token.symbol = null;
//   }

//   token.save();
// }
