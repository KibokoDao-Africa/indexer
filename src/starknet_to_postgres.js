// src/starknet_to_postgres.ts

import { decodeTransfersInBlock, filter } from "../common/starknet.js";
import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

const dbClient = new Client({
  user: "postgres",
  database: "postgres",
  hostname: "localhost",
  password: "postgres",
  port: 5432,
});

await dbClient.connect();

export const config = {
  streamUrl: "https://sepolia.starknet.a5a.ch",  // Use the appropriate Apibara stream URL
  startingBlock: 1_000,  // Set the appropriate starting block
  network: "starknet",
  filter,
  sinkType: "custom",
  sinkOptions: {
    async processBlock(transfers) {
      for (const transfer of transfers) {
        const { transaction_hash, block_timestamp, token_transfer, nonce } = transfer;

        await dbClient.queryArray(
          `INSERT INTO transfers (transaction_hash, block_timestamp, token_transfer, nonce)
           VALUES ($1, $2, $3, $4)`,
          transaction_hash,
          block_timestamp,
          token_transfer,
          nonce
        );

        // Notify listeners
        await dbClient.queryArray(
          `NOTIFY new_transfer, '${transaction_hash}'`
        );
      }
    },
  },
};

export default decodeTransfersInBlock;
