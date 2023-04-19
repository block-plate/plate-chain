import merkle from 'merkle';

const getGenesisBlock = (): IBlock => {
  const version = '1.0.0';
  const height = 0;
  const hash =  '0'.repeat(64);
  const previousHash = '0'.repeat(64);
  const timestamp = Math.floor(1663897055 / 1000) // Fri Sep 23 2022 10:37:35 GMT+0900 (대한민국 표준시)
  const data = ["This is GenesisBlock that platechain made by EUNSOL in Sejong Univ"];
  const merkleTree = merkle("sha256").sync(data);
  const merkleRoot = merkleTree.root() || '0'.repeat(64);
  const nonce = 0;
  const difficulty = 0;

  const block = {
    difficulty, 
    version, 
    height, 
    previousHash, 
    hash, 
    timestamp, 
    merkleRoot, 
    data, 
    nonce
  };

  return block;
}

const getLength = (db: any) => {
  const {blocks} = db.getBlocks();

  return blocks.rows.length;
}

export {
  getLength,
  getGenesisBlock
};
