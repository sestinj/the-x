import { BigInt } from "@graphprotocol/graph-ts";
import {
  NewAuction as NewAuctionEvent,
  NewManagedToken as NewManagedTokenEvent,
} from "../../generated/AuctionFactory/AuctionFactory";
import { Auction, Token } from "../../generated/schema";
import { FixedPriceAuction } from "../../generated/templates";

export function handleNewAuction(event: NewAuctionEvent): void {
  let auction = new Auction(event.params.auctionAddress.toHex());
  auction.owner = event.params.owner.toHex();
  auction.price = event.params.price;
  auction.supply = BigInt.fromString("0");
  auction.open = true;
  auction.personalStake = event.params.personalStake;
  auction.purchases = [];
  auction.token = event.params.tokenAddress.toHex();
  auction.description = "";
  auction.startDate = event.block.timestamp;
  auction.endDate = event.block.timestamp.plus(
    BigInt.fromString("864000") // 60 * 60 * 24 * 10
  );
  auction.type = "Fixed Price";
  auction.save();

  FixedPriceAuction.create(event.params.auctionAddress);
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
