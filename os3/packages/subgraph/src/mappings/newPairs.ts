import { NewPair as NewPairEvent } from "../../generated/CentralDex/CentralDex";
import { Pair } from "../../generated/schema";
import { addToken } from "./tokens";

export function handleNewPair(event: NewPairEvent): void {
  let transactionHash = event.transaction.hash.toHex();
  let pair = new Pair(transactionHash);
  pair.token1 = event.params.token1.toHex();
  pair.token2 = event.params.token2.toHex();
  pair.address = event.params.dexAddress.toHex();
  pair.save();
  //   addToken(event.transaction.to.toHex());
}
