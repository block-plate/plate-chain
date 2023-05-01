export const GENESIS: IBlock = {
    version: "1.0.0",
    height: 0,
    timestamp: new Date().getTime(),
    hash: "0".repeat(64),
    previousHash: "0".repeat(64),
    merkleRoot: "0".repeat(64),
    difficulty: 0,
    nonce: 0,
    data: [
      
    ],
  };

  export const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;

  export const BLOCK_GENERATION_INTERVAL: number = 10;

  export const BLOCK_GENERATION_TIME_UNIT: number = 60;