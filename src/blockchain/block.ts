import { SHA256 } from 'crypto-js';
import merkle from 'merkle';
import { BlockHeader } from './blockHeader';

export class Block extends BlockHeader implements IBlock{
    public merkleRoot: string;
    public hash: string;
    public nonce: number;
    public difficulty: number;
    public data: string[];
    
    constructor(_previousBlock: Block, _data: string[]){
        super(_previousBlock);

        const merkleRoot = Block.getMerkleRoot(_data);
        this.merkleRoot = merkleRoot;
        this.hash = Block.createBlockHash(this);
        this.nonce = 0;
        this.difficulty = 0;
        this.data = _data;
    }

    public static getMerkleRoot<T>(_data: T[]): string {
        const merkleTree = merkle("sha256").sync(_data);
        return merkleTree.root();
    }

    public static createBlockHash(_block: Block): string {
        const { version, timestamp, height, merkleRoot, previousHash } = _block;
        const values: string = `${version}${timestamp}${height}${merkleRoot}${previousHash}`;

        return SHA256(values).toString();
    }

    public static generateBlock(_previousBlock: Block, _data: string[]): Block{
        const _generateBlock = new Block(_previousBlock, _data);
        return _generateBlock;
    }

    public static isValidNewBlock(
        _newBlock: Block,
        _previousBlock: Block
    ): Failable<Block, string> {
        if( _previousBlock.height + 1 !== _newBlock.height )
            return {isError: true, error: 'height error' };
        if (_previousBlock.hash !== _newBlock.previousHash )
            return {isError: true, error: 'previousHash error' };
        if (Block.createBlockHash(_newBlock) !== _newBlock.hash)
            return {isError: true, error: 'block hash error' };
        
        return {isError: false, value: _newBlock }
    }

    public static getGenesisBlock(): IBlock {
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
}