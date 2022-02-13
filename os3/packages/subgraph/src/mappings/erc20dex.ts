import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { LiquidityPosition, Pair, Swap, User } from "../../generated/schema";
import {
  LiquidityAdd as LiquidityAddEvent,
  LiquidityRemoval as LiquidityRemovalEvent,
  Swap as NewSwapEvent,
} from "../../generated/templates/Erc20Dex/Erc20Dex";

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
    pair.volume = pair.volume.plus(
      event.params.quantity2.times(BigInt.fromString("2"))
    );
    pair.save();
  }
}

export function handleLiquidityAdd(event: LiquidityAddEvent): void {
  let liquidityPosition = LiquidityPosition.load(
    event.params.sender.toHex() + event.address.toHex()
  );
  if (liquidityPosition !== null) {
    liquidityPosition.amount = liquidityPosition.amount.plus(event.params.n);
  } else {
    liquidityPosition = new LiquidityPosition(
      event.params.sender.toHex() + event.address.toHex()
    ); // Deterministic ID??? UserID + exchangeID
    liquidityPosition.pair = event.address.toHex();
    liquidityPosition.amount = event.params.n;
  }
  liquidityPosition.save();

  let user = User.load(event.params.sender.toHex());
  if (user !== null) {
    user.liquidityPositions = [liquidityPosition.id];
  } else {
    user = new User(event.params.sender.toHex());
    user.liquidityPositions = [liquidityPosition.id];
    user.address = event.params.sender.toHex();
    user.swaps = [];
  }
  user.save();
}

export function handleLiquidityRemoval(event: LiquidityRemovalEvent): void {
  let liquidityPosition = LiquidityPosition.load(
    event.params.sender.toHex() + event.address.toHex()
  );
  if (liquidityPosition !== null) {
    liquidityPosition.amount = liquidityPosition.amount.minus(event.params.n);
  } else {
    // This should never happen
  }
  liquidityPosition.save();
}
