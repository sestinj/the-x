import {
  HomeIcon,
  CurrencyDollarIcon,
  CogIcon,
  TrendingUpIcon,
  PlusCircleIcon,
} from "@heroicons/react/solid";

export default [
  {
    title: "Home",
    route: "/home",
    icon: HomeIcon,
  },
  {
    title: "Exchange",
    route: "/exchange",
    icon: TrendingUpIcon,
  },
  {
    title: "Liquidity Pools",
    route: "/newpair",
    icon: PlusCircleIcon,
  },
  {
    title: "New Personal Token",
    route: "/createtoken",
    icon: CurrencyDollarIcon,
  },
  {
    title: "Manage Personal Token",
    route: "/manageToken",
    icon: CogIcon,
  },
];
