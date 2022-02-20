import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import {
  DailyStats,
  HourlyStats,
  LiquidityPosition,
  Pair,
  Swap,
  User,
} from "../../generated/schema";
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
  let newPrice = BigDecimal.fromString(event.params.newPrice.toString()).div(
    shift
  );
  swap.newPrice = newPrice;
  swap.isForward = event.params.isForward;
  swap.token1 = event.params.token1.toHex();
  swap.token2 = event.params.token2.toHex();
  swap.timestamp = event.block.timestamp;
  swap.save();

  let pair = Pair.load(
    event.params.token1.toHex() + event.params.token2.toHex()
  );
  if (pair !== null) {
    pair.price = swap.newPrice;
    pair.volume = pair.volume.plus(
      event.params.quantity2.times(BigInt.fromString("2"))
    );

    let swaps = pair.swaps;
    swaps.push(swap.id);
    pair.swaps = swaps;

    // DAILY AND HOURLY STATS
    let dailyStatsList = pair.dailyStats;
    let hourlyStatList = pair.hourlyStats;

    let day = event.block.timestamp.div(BigInt.fromI32(60 * 60 * 24));
    let hour = event.block.timestamp.div(BigInt.fromI32(60 * 60));

    let lastDailyStats = DailyStats.load(pair.lastDailyStats);
    let lastHourlyStats = HourlyStats.load(pair.lastHourlyStats);

    // for (let i = lastDailyStats.day.toI32() + 1; i < day.toI32(); i++) {
    //   let dailyStats = new DailyStats(i.toString());
    //   dailyStats.day = BigInt.fromI32(i);
    //   dailyStats.price = lastDailyStats.price;
    //   dailyStats.save();
    //   dailyStatsList.push(dailyStats.id);
    // }

    // for (let i = lastHourlyStats.hour.toI32() + 1; i < hour.toI32(); i++) {
    //   let hourlyStats = new HourlyStats(i.toString());
    //   hourlyStats.hour = BigInt.fromI32(i);
    //   hourlyStats.price = lastHourlyStats.price;
    //   hourlyStats.save();
    //   hourlyStatList.push(hourlyStats.id);
    // }

    let dailyStats = new DailyStats(day.toString());
    dailyStats.day = day;
    dailyStats.price = newPrice;
    dailyStats.save();
    dailyStatsList.push(dailyStats.id);

    let hourlyStats = new HourlyStats(hour.toString());
    hourlyStats.hour = hour;
    hourlyStats.price = newPrice;
    hourlyStats.save();
    hourlyStatList.push(hourlyStats.id);

    pair.dailyStats = dailyStatsList;
    pair.hourlyStats = hourlyStatList;

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
