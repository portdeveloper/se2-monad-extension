export const preContent = `
import { monadTestnet } from "./utils/monadTestnet";
`;

export const configOverrides = {
  targetNetworks: ["$$monadTestnet$$"],
};

export const skipLocalChainInTargetNetworks = false;
