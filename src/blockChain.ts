import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import merkle from 'merkle';
import { BlockData, BlockHeader } from './block';
import {Block} from './blockchain/block';

// Get UTC timestamp
const utcTimestamp = () => moment().utc().valueOf();

// const calculateHashForBlock = (block: Block) => {
//   return calculateHash(
//     block.version,
//     block.height,
//     block.previousHash,
//     block.merkleRoot,
//     block.timestamp,
//     block.data,
//   )
// }

// const calculateHash = (
//   version: string,
//   index: number,
//   previousHash: string,
//   merkleRoot: string, 
//   timestamp: number, 
//   data: string[],
// ) => {
//   return CryptoJS.SHA256(version+ index+ previousHash+ merkleRoot+ event_id+ organization+ generated_time+ data).toString().toUpperCase();
// }

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

const getCurrentVersion = () => {
  //const packageJson: any = fs.readFileSync("../../package.json");
  //const currentVersion = JSON.parse(packageJson).version;
  return '1.0.0';
}

const getLength = (db: any) => {
  const {blocks} = db.getBlocks();

  return blocks.rows.length;
}

// Generate a block
// const generateNextBlock = async(db: any, organization: string, data: any):Promise<Block> => {
//   const previousBlock: Block = await db.getLeastBlock();
//   const currentVersion = getCurrentVersion();
//   const nextHeight = previousBlock.height + 1;
//   const previousHash = calculateHashForBlock(previousBlock);
//   const event_id = uuidv4()
//   const timestamp = utcTimestamp();

//   const merkleTree = merkle("sha256").sync([data]);
//   const merkleRoot = merkleTree.root() || '0'.repeat(64);
//   //  Nonce , difficulty
//   const newBlock: Block = {
//     version:currentVersion, 
//     height:nextHeight, 
//     previousHash, 
//     timestamp, 
//     merkleRoot
//   }

//   return newBlock
// }

// Check if a block is valid
// const isValidBlock = async(db: any, logger: any, block: Block) => {
//   const previousBlock: Block = await db.getLeastBlock();
//   if(previousBlock.header.index + 1 !== block.header.index) {
//     logger.error('Invaild index');
//     return false;
//   }
//   else if(calculateHashForBlock(previousBlock) !== block.header.previousHash) {
//     logger.error('Invaild previousHash')
//     return false;
//   }
//   else{
//     if(
//       (merkle("sha256").sync([block.data]).root() !== block.header.merkleRoot)
//       || ('0'.repeat(64) !== block.header.merkleRoot)
//     ) {
//       logger.error('Invaild merkleRoot');
//       return false;
//     }
//   }
//   return true;
// }


// Export block methods
export {
  // generateNextBlock,
  // isValidBlock,
  getLength,
  getGenesisBlock
};
