import { NewPair as NewPairEvent } from "../../generated/CentralDex/CentralDex";
import { Pair } from "../../generated/schema";

export function handleNewPair(event: NewPairEvent): void {
  let transactionHash = event.transaction.hash.toHex();
  let pair = new Pair(transactionHash);
  pair.token1 = event.params.token1.toHex();
  pair.token2 = event.params.token2.toHex();
  pair.address = event.params.dexAddress.toHex();
  pair.save();
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
