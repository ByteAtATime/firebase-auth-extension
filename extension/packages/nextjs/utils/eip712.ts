export const EIP_712_DOMAIN = {
  name: "Scaffold-ETH 2 App",
  version: "1",
} as const;

export const EIP_712_TYPES__AUTHENTICATE = {
  Message: [
    { name: "user", type: "address" },
    { name: "timestamp", type: "uint256" },
  ],
};
