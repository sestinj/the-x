import { NewPair as NewPairEvent } from "../../generated/CentralDex/CentralDex";
import { Pair, Token } from "../../generated/schema";
import { ERC20 as ERC20Contract } from "../../generated/templates/ERC20/ERC20";

export function handleNewPair(event: NewPairEvent): void {
  let address1 = event.params.token1;
  let address2 = event.params.token2;
  let pair = new Pair(address1.toHex() + address2.toHex());
  pair.token1 = address1.toHex();
  pair.token2 = address2.toHex();
  pair.address = event.params.dexAddress.toHex();
  pair.price = 1; // This isn't accurate, but you have to set it to something and pretty sure this won't have consequences
  pair.swaps = [];
  pair.save();

  let token1 = new Token(address1.toHex());
  let token1Contract = ERC20Contract.bind(address1);
  token1.address = address1.toHex();
  token1.name = token1Contract.name();
  token1.symbol = token1Contract.symbol();
  token1.pairs1 = [pair.id];
  token1.pairs2 = [];
  token1.save();

  let token2 = new Token(address2.toHex());
  let token2Contract = ERC20Contract.bind(address2);
  token2.address = address2.toHex();
  token2.name = token2Contract.name();
  token2.symbol = token2Contract.symbol();
  token2.pairs2 = [pair.id];
  token2.pairs1 = [];
  token2.save();
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
