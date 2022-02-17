import { Auction, AuctionPurchase } from "../../generated/schema";
import {
  AuctionClosed as NewAuctionClosedEvent,
  PurchaseEvent as NewPurchaseEvent,
} from "../../generated/templates/FixedPriceAuction/FixedPriceAuction";

export function handlePurchase(event: NewPurchaseEvent): void {
  let auction = Auction.load(event.address.toHex());

  auction.supply = auction.supply.plus(event.params.amount);

  let purchase = new AuctionPurchase(event.transaction.hash.toHex());
  purchase.amount = event.params.amount;
  purchase.purchaser = event.params.purchaser.toHex();
  purchase.blockNumber = event.block.number;
  purchase.save();

  auction.purchases = [event.transaction.hash.toHex()];
  auction.save();
}

export function handleAuctionClosed(event: NewAuctionClosedEvent): void {
  let auction = Auction.load(event.address.toHex());
  auction.open = false;
  auction.save();
}
