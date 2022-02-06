import { Swap as NewSwapEvent } from "../../generated/templates/Erc20Dex/Erc20Dex";
import { Swap, Pair } from "../../generated/schema";
import { BigDecimal, log } from "@graphprotocol/graph-ts";

export function handleSwap(event: NewSwapEvent): void {
  const shift = BigDecimal.fromString(
    "340282366920938463463374607431768211456"
  ); // TODO Obviously

  let txHash = event.transaction.hash.toHex();
  let swap = new Swap(txHash);
  swap.sender = event.params.sender.toHex();
  log.debug("Quantity1: {}", [event.params.quantity1.toString()]);
  swap.quantity1 = event.params.quantity1;
  swap.quantity2 = event.params.quantity2;
  swap.fees = event.params.fees;
  swap.newPrice = BigDecimal.fromString(event.params.newPrice.toString()).div(
    shift
  );
  swap.isForward = event.params.isForward;
  swap.token1 = event.params.token1.toHex();
  swap.token2 = event.params.token2.toHex();
  swap.save();

  let pair = Pair.load(
    event.params.token1.toHex() + event.params.token2.toHex()
  );
  if (pair !== null) {
    pair.price = swap.newPrice;
    pair.save();
  }
}
