import { BigInt } from "@graphprotocol/graph-ts";
import {
  NewAuction as NewAuctionEvent,
  NewManagedToken as NewManagedTokenEvent,
} from "../../generated/AuctionFactory/AuctionFactory";
import { Auction, Token } from "../../generated/schema";

export function handleNewAuction(event: NewAuctionEvent): void {
  let auction = new Auction(event.params.auctionAddress.toHex());
  auction.owner = event.params.owner.toHex();
  auction.price = event.params.price;
  auction.supply = BigInt.fromString("0");
  auction.open = true;
  auction.personalStake = event.params.personalStake;
  auction.purchases = [];
  auction.token = event.params.tokenAddress.toHex();
  auction.save();
}

export function handleNewManagedToken(event: NewManagedTokenEvent): void {
  let token = new Token(event.params.tokenAddress.toHex());
  token.pairs1 = [];
  token.pairs2 = [];
  token.symbol = event.params.symbol;
  token.name = event.params.name;
  token.address = event.params.tokenAddress.toHex();
  token.save();
}
