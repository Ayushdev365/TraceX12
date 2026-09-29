import type { ChainId, Reliability } from "./types";

export const DATASET_VERSION = "2026-09-17.1";
export const DATASET_NOTES =
  "Public Etherscan nametags (blockchainanalysis.io compilation), TronScan/community exchange labels, Tornado Cash official contracts, well-known L2/bridge contracts. Not an exhaustive or certified attribution set.";

export interface SeedVasp {
  id: string;
  name: string;
  category: string;
  jurisdiction: string;
  website: string;
  notes: string;
}

export interface SeedAddress {
  vaspId: string;
  chain: ChainId;
  address: string;
  label: string;
  source: string;
  sourceUrl: string;
  verificationStatus: string;
  verifiedAt: string;
  reliability: Reliability;
}

export interface SeedRisk {
  chain: ChainId;
  address: string;
  entityType: "mixer" | "bridge" | "sanctioned";
  name: string;
  source: string;
  sourceUrl: string;
  notes: string;
}

export const SEED_VASPS: SeedVasp[] = [
  { id: "binance", name: "Binance", category: "exchange", jurisdiction: "Global / Cayman / Dubai", website: "https://www.binance.com", notes: "Dominant cash-out rail in many South/Southeast Asian scam cases." },
  { id: "coinbase", name: "Coinbase", category: "exchange", jurisdiction: "United States", website: "https://www.coinbase.com", notes: "US-regulated VASP. Does not support TRC-20 USDT deposits." },
  { id: "kraken", name: "Kraken", category: "exchange", jurisdiction: "United States", website: "https://www.kraken.com", notes: "US-regulated VASP." },
  { id: "okx", name: "OKX", category: "exchange", jurisdiction: "Seychelles / Hong Kong", website: "https://www.okx.com", notes: "Major USDT cash-out venue." },
  { id: "kucoin", name: "KuCoin", category: "exchange", jurisdiction: "Seychelles", website: "https://www.kucoin.com", notes: "" },
  { id: "crypto_com", name: "Crypto.com", category: "exchange", jurisdiction: "Singapore / global", website: "https://crypto.com", notes: "" },
  { id: "gate_io", name: "Gate.io", category: "exchange", jurisdiction: "Cayman / Hong Kong", website: "https://www.gate.io", notes: "" },
  { id: "bybit", name: "Bybit", category: "exchange", jurisdiction: "Dubai / Singapore", website: "https://www.bybit.com", notes: "" },
  { id: "bitfinex", name: "Bitfinex", category: "exchange", jurisdiction: "British Virgin Islands", website: "https://www.bitfinex.com", notes: "" },
  { id: "gemini", name: "Gemini", category: "exchange", jurisdiction: "United States", website: "https://www.gemini.com", notes: "" },
  { id: "htx", name: "HTX (Huobi)", category: "exchange", jurisdiction: "Seychelles", website: "https://www.htx.com", notes: "Hot wallets rotate frequently; labels can go stale." },
  { id: "mexc", name: "MEXC", category: "exchange", jurisdiction: "Seychelles", website: "https://www.mexc.com", notes: "" },
  { id: "bitget", name: "Bitget", category: "exchange", jurisdiction: "Seychelles / Singapore", website: "https://www.bitget.com", notes: "" },
  { id: "bitstamp", name: "Bitstamp", category: "exchange", jurisdiction: "Luxembourg / EU", website: "https://www.bitstamp.net", notes: "" },
  { id: "bithumb", name: "Bithumb", category: "exchange", jurisdiction: "South Korea", website: "https://www.bithumb.com", notes: "" },
  { id: "ftx", name: "FTX (defunct)", category: "exchange", jurisdiction: "Estate / historical", website: "https://www.ftx.com", notes: "Defunct exchange. Historical labels only." },
  { id: "robinhood", name: "Robinhood", category: "exchange", jurisdiction: "United States", website: "https://robinhood.com", notes: "US broker-dealer / VASP." },
  { id: "bingx", name: "BingX", category: "exchange", jurisdiction: "Global", website: "https://bingx.com", notes: "" },
];

const ETHERSCAN_TAG = "https://blockchainanalysis.io/top-wallets/ethereum/exchanges";
const ES = (addr: string) => `https://etherscan.io/address/${addr}`;
const TS = (addr: string) => `https://tronscan.org/#/address/${addr}`;

export const SEED_ADDRESSES: SeedAddress[] = [
  // Ethereum — Etherscan nametags compiled 2026-09-13
  { vaspId: "binance", chain: "ethereum", address: "0x5a52e96bacdabb82fd05763e25335261b270efcb", label: "Binance 28", source: "Etherscan nametag", sourceUrl: ES("0x5a52e96bacdabb82fd05763e25335261b270efcb"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "binance", chain: "ethereum", address: "0x21a31ee1afc51d94c2efccaa2092ad1028285549", label: "Binance 15", source: "Etherscan nametag", sourceUrl: ES("0x21a31ee1afc51d94c2efccaa2092ad1028285549"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "binance", chain: "ethereum", address: "0x28c6c06298d514db089934071355e5743bf21d60", label: "Binance 14", source: "Etherscan nametag", sourceUrl: ES("0x28c6c06298d514db089934071355e5743bf21d60"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "binance", chain: "ethereum", address: "0x56eddb7aa87536c09ccc2793473599fd21a8b17f", label: "Binance 17", source: "Etherscan nametag", sourceUrl: ES("0x56eddb7aa87536c09ccc2793473599fd21a8b17f"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "binance", chain: "ethereum", address: "0xdfd5293d8e347dfe59e90efd55b2956a1343963d", label: "Binance 16", source: "Etherscan nametag", sourceUrl: ES("0xdfd5293d8e347dfe59e90efd55b2956a1343963d"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "binance", chain: "ethereum", address: "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8", label: "Binance 7", source: "Etherscan nametag", sourceUrl: ES("0xbe0eb53f46cd790cd13851d5eff43d12404d33e8"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "binance", chain: "ethereum", address: "0xf977814e90da44bfa03b6295a0616a897441acec", label: "Binance Hot Wallet 20", source: "Etherscan nametag", sourceUrl: ES("0xf977814e90da44bfa03b6295a0616a897441acec"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "binance", chain: "ethereum", address: "0xa344c7ada83113b3b56941f6e85bf2eb425949f3", label: "Binance 27", source: "Etherscan nametag", sourceUrl: ES("0xa344c7ada83113b3b56941f6e85bf2eb425949f3"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "binance", chain: "ethereum", address: "0x00799bbc833d5b168f0410312d2a8fd9e0e3079c", label: "Binance 31", source: "Etherscan nametag", sourceUrl: ES("0x00799bbc833d5b168f0410312d2a8fd9e0e3079c"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "binance", chain: "ethereum", address: "0x06a0048079ec6571cd1b537418869cde6191d42d", label: "Binance 29", source: "Etherscan nametag", sourceUrl: ES("0x06a0048079ec6571cd1b537418869cde6191d42d"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "binance", chain: "ethereum", address: "0x141fef8cd8397a390afe94846c8bd6f4ab981c48", label: "Binance 32", source: "Etherscan nametag", sourceUrl: ES("0x141fef8cd8397a390afe94846c8bd6f4ab981c48"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "binance", chain: "ethereum", address: "0x2e581a5ae722207aa59acd3939771e7c7052dd3d", label: "Binance 25", source: "Etherscan nametag", sourceUrl: ES("0x2e581a5ae722207aa59acd3939771e7c7052dd3d"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "coinbase", chain: "ethereum", address: "0x71660c4005ba85c37ccec55d0c4493e66fe775d3", label: "Coinbase 1", source: "Etherscan nametag", sourceUrl: ES("0x71660c4005ba85c37ccec55d0c4493e66fe775d3"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "coinbase", chain: "ethereum", address: "0x503828976d22510aad0201ac7ec88293211d23da", label: "Coinbase 2", source: "Etherscan nametag", sourceUrl: ES("0x503828976d22510aad0201ac7ec88293211d23da"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "coinbase", chain: "ethereum", address: "0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740", label: "Coinbase 3", source: "Etherscan nametag", sourceUrl: ES("0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "coinbase", chain: "ethereum", address: "0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43", label: "Coinbase 10", source: "Etherscan nametag", sourceUrl: ES("0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "kraken", chain: "ethereum", address: "0x2910543af39aba0cd09dbb2d50200b3e800a63d2", label: "Kraken", source: "Etherscan nametag", sourceUrl: ES("0x2910543af39aba0cd09dbb2d50200b3e800a63d2"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "kraken", chain: "ethereum", address: "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0", label: "Kraken 4", source: "Etherscan nametag", sourceUrl: ES("0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "kraken", chain: "ethereum", address: "0x29728d0efd284d85187362faa2d4d76c2cfc2612", label: "Kraken 9", source: "Etherscan nametag", sourceUrl: ES("0x29728d0efd284d85187362faa2d4d76c2cfc2612"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "okx", chain: "ethereum", address: "0x6cc5f688a315f3dc28a7781717a9a798a59fda7b", label: "OKX", source: "Etherscan nametag", sourceUrl: ES("0x6cc5f688a315f3dc28a7781717a9a798a59fda7b"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "okx", chain: "ethereum", address: "0x236f9f97e0e62388479bf9e5ba4889e46b0273c3", label: "OKX 2", source: "Etherscan nametag", sourceUrl: ES("0x236f9f97e0e62388479bf9e5ba4889e46b0273c3"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "okx", chain: "ethereum", address: "0xa7efae728d2936e78bda97dc267687568dd593f3", label: "OKX 3", source: "Etherscan nametag", sourceUrl: ES("0xa7efae728d2936e78bda97dc267687568dd593f3"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "okx", chain: "ethereum", address: "0x2c8fbb630289363ac80705a1a61273f76fd5a161", label: "OKX 4", source: "Etherscan nametag", sourceUrl: ES("0x2c8fbb630289363ac80705a1a61273f76fd5a161"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "okx", chain: "ethereum", address: "0x461249076b88189f8ac9418de28b365859e46bfd", label: "OKX 9", source: "Etherscan nametag", sourceUrl: ES("0x461249076b88189f8ac9418de28b365859e46bfd"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "okx", chain: "ethereum", address: "0x42436286a9c8d63aafc2eebbca193064d68068f2", label: "OKX 11", source: "Etherscan nametag", sourceUrl: ES("0x42436286a9c8d63aafc2eebbca193064d68068f2"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "kucoin", chain: "ethereum", address: "0xd6216fc19db775df9774a6e33526131da7d19a2c", label: "KuCoin 6", source: "Etherscan nametag", sourceUrl: ES("0xd6216fc19db775df9774a6e33526131da7d19a2c"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "kucoin", chain: "ethereum", address: "0xf16e9b0d03470827a95cdfd0cb8a8a3b46969b91", label: "KuCoin 9", source: "Etherscan nametag", sourceUrl: ES("0xf16e9b0d03470827a95cdfd0cb8a8a3b46969b91"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "kucoin", chain: "ethereum", address: "0x738cf6903e6c4e699d1c2dd9ab8b67fcdb3121ea", label: "KuCoin 12", source: "Etherscan nametag", sourceUrl: ES("0x738cf6903e6c4e699d1c2dd9ab8b67fcdb3121ea"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "kucoin", chain: "ethereum", address: "0xec30d02f10353f8efc9601371f56e808751f396f", label: "KuCoin 11", source: "Etherscan nametag", sourceUrl: ES("0xec30d02f10353f8efc9601371f56e808751f396f"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "crypto_com", chain: "ethereum", address: "0x6262998ced04146fa42253a5c0af90ca02dfd2a3", label: "Crypto.com", source: "Etherscan nametag", sourceUrl: ES("0x6262998ced04146fa42253a5c0af90ca02dfd2a3"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "crypto_com", chain: "ethereum", address: "0x46340b20830761efd32832a74d7169b29feb9758", label: "Crypto.com 2", source: "Etherscan nametag", sourceUrl: ES("0x46340b20830761efd32832a74d7169b29feb9758"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "crypto_com", chain: "ethereum", address: "0x72a53cdbbcc1b9efa39c834a540550e23463aacb", label: "Crypto.com 3", source: "Etherscan nametag", sourceUrl: ES("0x72a53cdbbcc1b9efa39c834a540550e23463aacb"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "gate_io", chain: "ethereum", address: "0x0d0707963952f2fba59dd06f2b425ace40b492fe", label: "Gate.io", source: "Etherscan nametag", sourceUrl: ES("0x0d0707963952f2fba59dd06f2b425ace40b492fe"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "gate_io", chain: "ethereum", address: "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c", label: "Gate.io 3", source: "Etherscan nametag", sourceUrl: ES("0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "bybit", chain: "ethereum", address: "0xf89d7b9c864f589bbf53a82105107622b35eaa40", label: "Bybit Hot Wallet", source: "Etherscan nametag", sourceUrl: ES("0xf89d7b9c864f589bbf53a82105107622b35eaa40"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "bybit", chain: "ethereum", address: "0x1db92e2eebc8e0c075a02bea49a2935bcd2dfcf4", label: "Bybit Cold Wallet", source: "Etherscan nametag", sourceUrl: ES("0x1db92e2eebc8e0c075a02bea49a2935bcd2dfcf4"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "bitfinex", chain: "ethereum", address: "0x876eabf441b2ee5b5b0554fd502a8e0600950cfa", label: "Bitfinex 3", source: "Etherscan nametag", sourceUrl: ES("0x876eabf441b2ee5b5b0554fd502a8e0600950cfa"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "bitfinex", chain: "ethereum", address: "0x77134cbc06cb00b66f4c7e623d5fdbf6777635ec", label: "Bitfinex Hot Wallet", source: "Etherscan nametag", sourceUrl: ES("0x77134cbc06cb00b66f4c7e623d5fdbf6777635ec"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "gemini", chain: "ethereum", address: "0xd24400ae8bfebb18ca49be86258a3c749cf46853", label: "Gemini", source: "Etherscan nametag", sourceUrl: ES("0xd24400ae8bfebb18ca49be86258a3c749cf46853"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "gemini", chain: "ethereum", address: "0x6fc82a5fe25a5cdb58bc74600a40a69c065263f8", label: "Gemini 2", source: "Etherscan nametag", sourceUrl: ES("0x6fc82a5fe25a5cdb58bc74600a40a69c065263f8"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "htx", chain: "ethereum", address: "0xab5c66752a9e8167967685f1450532fb96d5d24f", label: "Huobi 1", source: "Etherscan nametag", sourceUrl: ES("0xab5c66752a9e8167967685f1450532fb96d5d24f"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "medium" },
  { vaspId: "htx", chain: "ethereum", address: "0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b", label: "Huobi 2", source: "Etherscan nametag", sourceUrl: ES("0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "medium" },
  { vaspId: "htx", chain: "ethereum", address: "0xfa4b5be3f2f84f56703c42eb22142744e95a2c58", label: "Huobi 11", source: "Etherscan nametag", sourceUrl: ES("0xfa4b5be3f2f84f56703c42eb22142744e95a2c58"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "medium" },
  { vaspId: "htx", chain: "ethereum", address: "0x18916e1a2933cb349145a280473a5de8eb6630cb", label: "Huobi Deposit Funder 2", source: "Etherscan nametag", sourceUrl: ES("0x18916e1a2933cb349145a280473a5de8eb6630cb"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "medium" },
  { vaspId: "mexc", chain: "ethereum", address: "0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88", label: "MEXC Hot Wallet", source: "Etherscan nametag", sourceUrl: ES("0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "bitget", chain: "ethereum", address: "0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689", label: "Bitget Hot Wallet", source: "Etherscan nametag", sourceUrl: ES("0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "bitstamp", chain: "ethereum", address: "0x00bdb5699745f5b860228c8f939abf1b9ae374ed", label: "Bitstamp 1", source: "Etherscan nametag", sourceUrl: ES("0x00bdb5699745f5b860228c8f939abf1b9ae374ed"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "bithumb", chain: "ethereum", address: "0x3052cd6bf951449a984fe4b5a38b46aef9455c8e", label: "Bithumb 2", source: "Etherscan nametag", sourceUrl: ES("0x3052cd6bf951449a984fe4b5a38b46aef9455c8e"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },
  { vaspId: "ftx", chain: "ethereum", address: "0xc098b2a3aa256d2140208c3de6543aaef5cd3a94", label: "FTX Exchange 2", source: "Etherscan nametag", sourceUrl: ES("0xc098b2a3aa256d2140208c3de6543aaef5cd3a94"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "medium" },
  { vaspId: "ftx", chain: "ethereum", address: "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2", label: "FTX Exchange", source: "Etherscan nametag", sourceUrl: ES("0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "medium" },
  { vaspId: "robinhood", chain: "ethereum", address: "0x40b38765696e3d5d8d9d834d8aad4bb6e418e489", label: "Robinhood", source: "Etherscan nametag", sourceUrl: ES("0x40b38765696e3d5d8d9d834d8aad4bb6e418e489"), verificationStatus: "public_nametag", verifiedAt: "2026-09-13", reliability: "high" },

  // Tron — public explorer / community labels. Reliability medium unless independently corroborated.
  { vaspId: "binance", chain: "tron", address: "TDqSquXBgUCLYvYC4XZgrprLK589dkhSCf", label: "Binance-Hot", source: "Public Tron USDT flow labels (StableScan / TronScan tags)", sourceUrl: TS("TDqSquXBgUCLYvYC4XZgrprLK589dkhSCf"), verificationStatus: "public_label", verifiedAt: "2026-09-17", reliability: "high" },
  { vaspId: "okx", chain: "tron", address: "TLaGjwhvA8XQYSxFAcAXy7Dvuue9eGYitv", label: "OKX Hot Wallet", source: "Public Tron USDT flow labels (StableScan)", sourceUrl: TS("TLaGjwhvA8XQYSxFAcAXy7Dvuue9eGYitv"), verificationStatus: "public_label", verifiedAt: "2026-09-17", reliability: "high" },
  { vaspId: "kraken", chain: "tron", address: "TG2CMGxnTPgQ6V58kiKd7wbyN8ewtAmY76", label: "Kraken Hot Wallet", source: "Public Tron USDT flow labels (StableScan)", sourceUrl: TS("TG2CMGxnTPgQ6V58kiKd7wbyN8ewtAmY76"), verificationStatus: "public_label", verifiedAt: "2026-09-17", reliability: "high" },
  { vaspId: "bybit", chain: "tron", address: "TKFvdC4UC1vtCoHZgn8eviK34kormXaqJ7", label: "Bybit", source: "Community Tron exchange label list", sourceUrl: TS("TKFvdC4UC1vtCoHZgn8eviK34kormXaqJ7"), verificationStatus: "community_label", verifiedAt: "2026-09-17", reliability: "medium" },
  { vaspId: "bybit", chain: "tron", address: "TU4vEruvZwLLkSfV9bNw12EJTPvNr7Pvaa", label: "Bybit", source: "Community Tron exchange label list", sourceUrl: TS("TU4vEruvZwLLkSfV9bNw12EJTPvNr7Pvaa"), verificationStatus: "community_label", verifiedAt: "2026-09-17", reliability: "medium" },
  { vaspId: "htx", chain: "tron", address: "TNaRAoLUyYEV2uF7GUrzSjRQTU8v5ZJ5VR", label: "HTX 1", source: "Community Tron exchange label list", sourceUrl: TS("TNaRAoLUyYEV2uF7GUrzSjRQTU8v5ZJ5VR"), verificationStatus: "community_label", verifiedAt: "2026-09-17", reliability: "medium" },
  { vaspId: "htx", chain: "tron", address: "TDvf1dSBhR7dEskJs17HxGHheJrjXhiFyM", label: "HTX 2", source: "Community Tron exchange label list", sourceUrl: TS("TDvf1dSBhR7dEskJs17HxGHheJrjXhiFyM"), verificationStatus: "community_label", verifiedAt: "2026-09-17", reliability: "medium" },
  { vaspId: "htx", chain: "tron", address: "TYh6mgoMNZTCsgpYHBz7gttEfrQmDMABub", label: "HTX Exchange", source: "Community Tron exchange label list", sourceUrl: TS("TYh6mgoMNZTCsgpYHBz7gttEfrQmDMABub"), verificationStatus: "community_label", verifiedAt: "2026-09-17", reliability: "medium" },
  { vaspId: "bitget", chain: "tron", address: "TFrRVZFoHty7scd2a1q6BDxPU5fyqiB4iR", label: "Bitget 1", source: "Community Tron exchange label list", sourceUrl: TS("TFrRVZFoHty7scd2a1q6BDxPU5fyqiB4iR"), verificationStatus: "community_label", verifiedAt: "2026-09-17", reliability: "medium" },
  { vaspId: "bitget", chain: "tron", address: "TYiQTHtgLo6KX6hYgbKLJsTbWK5hu9X5MG", label: "Bitget 2", source: "Community Tron exchange label list", sourceUrl: TS("TYiQTHtgLo6KX6hYgbKLJsTbWK5hu9X5MG"), verificationStatus: "community_label", verifiedAt: "2026-09-17", reliability: "medium" },
  { vaspId: "bitfinex", chain: "tron", address: "TXFBqBbqJommqZf7BV8NNYzePh97UmJodJ", label: "Bitfinex", source: "Community Tron exchange label list", sourceUrl: TS("TXFBqBbqJommqZf7BV8NNYzePh97UmJodJ"), verificationStatus: "community_label", verifiedAt: "2026-09-17", reliability: "medium" },
  { vaspId: "bithumb", chain: "tron", address: "TAbcGmwrQVT4A8pwEExxQvkW8hYqtvkC1h", label: "Bithumb 1", source: "Community Tron exchange label list", sourceUrl: TS("TAbcGmwrQVT4A8pwEExxQvkW8hYqtvkC1h"), verificationStatus: "community_label", verifiedAt: "2026-09-17", reliability: "medium" },
  { vaspId: "bingx", chain: "tron", address: "TMmQat2hx5D4zcnnPAHYLy2A4o4otzf1sG", label: "BingX", source: "Community Tron exchange label list", sourceUrl: TS("TMmQat2hx5D4zcnnPAHYLy2A4o4otzf1sG"), verificationStatus: "community_label", verifiedAt: "2026-09-17", reliability: "medium" },
];

export const SEED_RISK: SeedRisk[] = [
  { chain: "ethereum", address: "0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc", entityType: "mixer", name: "Tornado Cash 0.1 ETH pool", source: "Tornado Cash official docs", sourceUrl: "https://docs.tornado.cash/general/tornado-cash-smart-contracts", notes: "Mixer contract. OFAC-designated 2022, delisted Mar 2025. Still treated as obfuscation infrastructure." },
  { chain: "ethereum", address: "0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936", entityType: "mixer", name: "Tornado Cash 1 ETH pool", source: "Tornado Cash official docs", sourceUrl: "https://docs.tornado.cash/general/tornado-cash-smart-contracts", notes: "Mixer contract." },
  { chain: "ethereum", address: "0x910cbd523d972eb0a6f4cae4618ad62622b39dbf", entityType: "mixer", name: "Tornado Cash 10 ETH pool", source: "Tornado Cash official docs", sourceUrl: "https://docs.tornado.cash/general/tornado-cash-smart-contracts", notes: "Mixer contract." },
  { chain: "ethereum", address: "0xa160cdab225685da1d56aa342ad8841c3b53f291", entityType: "mixer", name: "Tornado Cash 100 ETH pool", source: "Tornado Cash official docs", sourceUrl: "https://docs.tornado.cash/general/tornado-cash-smart-contracts", notes: "Mixer contract." },
  { chain: "ethereum", address: "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b", entityType: "mixer", name: "Tornado Cash router", source: "OFAC SDN identifier list (2022 designation)", sourceUrl: "https://www.chainalysis.com/blog/tornado-cash-ofac-designation-sanctions/", notes: "Router. Delisted from SDN Mar 2025; still a mixer risk flag." },
  { chain: "ethereum", address: "0x722122df12d4e14e13ac3b6895a86e84145b6967", entityType: "mixer", name: "Tornado Cash proxy", source: "OFAC SDN identifier list (2022 designation)", sourceUrl: "https://www.chainalysis.com/blog/tornado-cash-ofac-designation-sanctions/", notes: "Mixer-related contract." },
  { chain: "ethereum", address: "0xd4b88df4d29f5cedd6857912842cff3b20c8cfa3", entityType: "mixer", name: "Tornado Cash 100 DAI pool", source: "Tornado Cash official docs", sourceUrl: "https://docs.tornado.cash/general/tornado-cash-smart-contracts", notes: "Mixer contract." },
  { chain: "ethereum", address: "0xa0c68c638235ee32657e8f720a23cec1bfc77c77", entityType: "bridge", name: "Polygon PoS Bridge", source: "Etherscan nametag / Polygon docs", sourceUrl: ES("0xa0c68c638235ee32657e8f720a23cec1bfc77c77"), notes: "Cross-chain bridge. Path continuity across chains is not followed in MVP." },
  { chain: "ethereum", address: "0x99c9fc46f92e8a1c0dec1b1747d010903e884be1", entityType: "bridge", name: "Optimism Gateway", source: "Etherscan nametag / Optimism docs", sourceUrl: ES("0x99c9fc46f92e8a1c0dec1b1747d010903e884be1"), notes: "L2 bridge." },
  { chain: "ethereum", address: "0x4dbd4fc535ac27206064b68ffcf827b0a60bab3f", entityType: "bridge", name: "Arbitrum Delayed Inbox", source: "Arbitrum docs / Etherscan", sourceUrl: ES("0x4dbd4fc535ac27206064b68ffcf827b0a60bab3f"), notes: "L2 bridge inbox." },
  { chain: "ethereum", address: "0x3ee18b2214aff97000d974cf647e7c347e8fa585", entityType: "bridge", name: "Wormhole Token Bridge", source: "Wormhole docs / Etherscan", sourceUrl: ES("0x3ee18b2214aff97000d974cf647e7c347e8fa585"), notes: "Cross-chain token bridge." },
  { chain: "ethereum", address: "0x8731d54e9d02c286767d56ac03e8037c07e01e98", entityType: "bridge", name: "Stargate Router", source: "Stargate docs / Etherscan", sourceUrl: ES("0x8731d54e9d02c286767d56ac03e8037c07e01e98"), notes: "Cross-chain liquidity bridge." },
];

void ETHERSCAN_TAG;
