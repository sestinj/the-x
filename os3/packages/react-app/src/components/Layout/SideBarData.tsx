import { ChatIcon } from "@heroicons/react/outline";
import {
  HomeIcon,
  CurrencyDollarIcon,
  CogIcon,
  TrendingUpIcon,
  PlusCircleIcon,
  BellIcon,
  PhotographIcon,
  PlayIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ClockIcon,
  EmojiHappyIcon,
  FingerPrintIcon,
  LightBulbIcon,
  PaperClipIcon,
  QrcodeIcon,
  RssIcon,
  SearchIcon,
  ShoppingCartIcon,
  TableIcon,
  TemplateIcon,
  UserGroupIcon,
  FilterIcon,
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
  {
    title: "Faucet",
    route: "/faucet",
    icon: FilterIcon,
  },
  // {
  //   title: "Notifications",
  //   route: "/notifications",
  //   icon: BellIcon,
  // },
  // {
  //   title: "Dashboard",
  //   route: "/dashboard",
  //   icon: TemplateIcon,
  // },
  // {
  //   title: "Fundraising",
  //   route: "/fundraise",
  //   icon: LightBulbIcon,
  // },
  // {
  //   title: "NFTs",
  //   route: "/nfts",
  //   icon: PhotographIcon, // or TicketIcon???
  // },
  // {
  //   title: "Games",
  //   route: "/play",
  //   icon: PlayIcon,
  // },
  // {
  //   title: "Citizenship",
  //   route: "/citizenship",
  //   icon: EmojiHappyIcon,
  // },
  // {
  //   title: "Legal",
  //   route: "/legal",
  //   icon: BriefcaseIcon, // or ScaleIcon
  // },
  // {
  //   title: "Learn",
  //   route: "/learn",
  //   icon: AcademicCapIcon,
  // },
  // {
  //   title: "History",
  //   route: "/history",
  //   icon: ClockIcon,
  // },
  // {
  //   title: "Messages",
  //   route: "/messages",
  //   icon: ChatIcon,
  // },
  // {
  //   title: "Identity",
  //   route: "/identity",
  //   icon: FingerPrintIcon,
  // },
  // {
  //   title: "IPFS Hosting",
  //   route: "/ipfs",
  //   icon: PaperClipIcon,
  // },
  // {
  //   title: "Quick Links",
  //   route: "/quicklinks",
  //   icon: QrcodeIcon,
  // },
  // {
  //   title: "Blog",
  //   route: "/blog",
  //   icon: RssIcon, // This could be something like mirror.xyz, but also tied to personal tokens, where "creators" can post content that they can profit off of. (also note that tip jars iframes might be a good idea. This is something that would bring a lot of attention back to your platform.) A special way for them to build their audience.
  // },
  // {
  //   title: "Search",
  //   route: "/search",
  //   icon: SearchIcon, // IDK exactly what this entails but there's a lot of info on the chain and it's not at all organized. If you're putting together all these services, there should be an easy way for people to search through everything
  // },
  // {
  //   title: "Shopping",
  //   route: "/shopping",
  //   icon: ShoppingCartIcon, // What does Amazon for Web3 look like? What could be different? Sellers owning more of the profits? Or is this just buying goods/rights to physical goods in NFT/token form?
  // },
  // {
  //   title: "Finances",
  //   route: "/finances",
  //   icon: TableIcon,
  // },
  // {
  //   title: "Friends",
  //   route: "/friends",
  //   icon: UserGroupIcon, // friends/contacts/social media
  // },
];
