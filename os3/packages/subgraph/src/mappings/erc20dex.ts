import {
  NewBid as NewBidEvent,
  NewAsk as NewAskEvent,
  Swap as NewSwapEvent,
} from "../../generated/templates/Erc20Dex/Erc20Dex";
import { Buy, Ask, User, Swap, Pair } from "../../generated/schema";

export function handleBid(event: NewBidEvent): void {
  let transactionHash = event.transaction.hash.toHex();
  let buy = new Buy(transactionHash);
  let sender = event.params.sender.toHex();
  buy.price = event.params.price.toI32();
  buy.quantity = event.params.quantity.toI32();
  buy.sender = sender;
  buy.save();

  let user = new User(sender);
  user.address = sender;
  user.buys.push(buy.id);
  user.save();

  let pair = new Pair(event.address.toHex());
  pair.buys.push(buy.id);
  pair.save();
}

export function handleAsk(event: NewAskEvent): void {
  let transactionHash = event.transaction.hash.toHex();
  let ask = new Ask(transactionHash);
  let sender = event.params.sender.toHex();
  ask.price = event.params.price.toI32();
  ask.quantity = event.params.quantity.toI32();
  ask.sender = sender;
  ask.save();

  let user = new User(sender);
  user.address = sender;
  user.asks.push(ask.id);
  user.save();

  let pair = new Pair(event.address.toHex());
  pair.asks.push(ask.id);
  pair.save();
}

export function handleSwap(event: NewSwapEvent): void {
  let txHash = event.transaction.hash.toHex();
  let swap = new Swap(txHash);
  swap.token1Sender = event.params.buyer.toHex();
  swap.token2Sender = event.params.seller.toHex();
  swap.token1Price = event.params.buyPrice.toI32();
  swap.token2Price = event.params.sellPrice.toI32();
  swap.spread = event.params.sellPrice.minus(event.params.buyPrice).toI32();
  swap.quantity = event.params.quantity.toI32();
  swap.save();

  let pair = new Pair(event.address.toHex());
  pair.price = event.params.buyPrice.toI32();
  pair.save();
}
