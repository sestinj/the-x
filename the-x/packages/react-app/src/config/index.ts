import { useContext } from "react";
import { ProviderContext } from "../App";
import index from "./index.json";
import local from "./local.json";
import mainnet from "./mainnet.json";
import ropsten from "./ropsten.json";

async function config() {
  const { provider } = useContext(ProviderContext);
  const network = await provider.getNetwork();
  switch (network.name) {
    case "ropsten":
      return ropsten;
    case "mainnet":
      return mainnet;
    case "how do you detect local?":
      return local;
    default:
      return index;
  }
}
// TODO - deal with invalid or unknown networks, display something on the wallet button
export default config;
