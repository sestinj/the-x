import { BigInt } from "@graphprotocol/graph-ts";
import { NewAuction as NewAuctionEvent } from "../../generated/AuctionFactory/AuctionFactory";
import { Auction } from "../../generated/schema";

export function handleNewAuction(event: NewAuctionEvent): void {
  let auction = new Auction(event.params.auctionAddress.toHex());
  auction.owner = event.params.owner.toHex();
  auction.price = event.params.price;
  auction.tokenAddress = event.params.tokenAddress.toHex();
  auction.supply = BigInt.fromString("0");
  auction.open = true;
  auction.personalStake = event.params.personalStake;
  auction.purchases = [];
  auction.save();
}
