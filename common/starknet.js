// common/starknet.js

import { hash, uint256 } from "https://cdn.jsdelivr.net/npm/starknet@5.14/+esm";

const _DECIMALS = 18;

export const filter = {
  header: {
    weak: true,
  },
  events: [
    {
      fromAddress:
        "0x83afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e",  // ERC20 contract address
      keys: [hash.getSelectorFromName("Transfer")],
      includeReceipt: true,
    },
  ],
};

export function decodeTransfersInBlock({ header, events }) {
  const { _blockNumber, _blockHash, timestamp } = header;
  return events.map(({ event, transaction }) => {
    const transactionHash = transaction.meta.hash;
    const _transferId = `${transactionHash}_${event.index}`;

    const [fromAddress, toAddress, amountLow, amountHigh] = event.data;
    const amountRaw = uint256.uint256ToBN({ low: amountLow, high: amountHigh });
    const tokenTransfer = {
      to_address: toAddress,
      from_address: fromAddress,
      for: amountRaw.toString(),
    };

    return {
      transaction_hash: transactionHash,
      block_timestamp: new Date(timestamp * 1000),  // Convert Unix timestamp to JS Date
      token_transfer: tokenTransfer,
      nonce: transaction.meta.nonce,
    };
  });
}
