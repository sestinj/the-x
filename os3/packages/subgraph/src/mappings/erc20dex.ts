import { Swap as NewSwapEvent } from "../../generated/templates/Erc20Dex/Erc20Dex";
import { User, Swap, Pair } from "../../generated/schema";

export function handleSwap(event: NewSwapEvent): void {
  let txHash = event.transaction.hash.toHex();
  let swap = new Swap(txHash);
  swap.sender = event.params.sender.toHex();
  swap.quantity1 = event.params.quantity1.toI32();
  swap.quantity2 = event.params.quantity2.toI32();
  swap.fees = event.params.fees.toI32();
  swap.newPrice = event.params.newPrice.toI32();
  swap.isForward = event.params.isForward;
  swap.save();

  let pair = new Pair(event.address.toHex());
  pair.price = event.params.newPrice.toI32();
  pair.save();
}
