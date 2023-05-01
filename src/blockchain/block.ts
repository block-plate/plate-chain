import { SHA256 } from 'crypto-js';
import merkle from 'merkle';
import { BlockHeader } from './blockHeader';
import { BLOCK_GENERATION_INTERVAL, BLOCK_GENERATION_TIME_UNIT, DIFFICULTY_ADJUSTMENT_INTERVAL, GENESIS } from './genesis';

import hexToBinary from 'hex-to-binary';

export class Block extends BlockHeader implements IBlock{
    public merkleRoot: string;
    public hash: string;
    public nonce: number;
    public difficulty: number;
    public data: ITransaction[];
    
    constructor(_previousBlock: Block, _data: ITransaction[], _adjustmentBlock: Block){
        super(_previousBlock);

        const merkleRoot = Block.getMerkleRoot(_data);
        this.merkleRoot = merkleRoot;
        this.hash = Block.createBlockHash(this);
        this.nonce = 0;
        this.difficulty = Block.getDifficulty(
            this,
            _adjustmentBlock,
            _previousBlock,
        );
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

    public static generateBlock(
        _previousBlock: Block, 
        _data: ITransaction[],
        _adjustmentBlock: Block,
    ): Block{
        const _generateBlock = new Block(_previousBlock, _data, _adjustmentBlock);

        const newBlock = Block.findBlock(_generateBlock);

        return newBlock;
    }

    public static findBlock(_generateBlock: Block){
        let hash: string;
        let nonce: number = 0;

        while(true) {
            nonce++;
            _generateBlock.nonce = nonce;
            hash = Block.createBlockHash(_generateBlock);

            const binary: string = hexToBinary(hash);

            const result: boolean = binary.startsWith(
                "0".repeat(_generateBlock.difficulty)
            );

            if(result){
                _generateBlock.hash = hash;
                return _generateBlock;
            }
        }
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

    public static getGenesisBlock(): Block {
        return GENESIS;
    }

    public static getDifficulty(
        _newBlock: Block,
        _adjustmentBlock: Block,
        _previousBlock: Block,
    ) : number{
        if( _newBlock.height <= 9 ) return 0;
        if( _newBlock.height <= 19 ) return 1;

        // 10번째 배수의 블록에 한에서만 난이도 조절 
        // 10개 묶음씩 같은 난이도를 가지게됨
        if( _newBlock.height % DIFFICULTY_ADJUSTMENT_INTERVAL !== 0){
            return _previousBlock.difficulty;
        }

        const timeTaken: number = _newBlock.timestamp - _adjustmentBlock.timestamp;
        const timeExpected: number = 
            BLOCK_GENERATION_INTERVAL *
            BLOCK_GENERATION_TIME_UNIT * 
            DIFFICULTY_ADJUSTMENT_INTERVAL // 6000

        if(timeTaken < timeExpected / 2 ) return _adjustmentBlock.difficulty + 1;
        else if(timeTaken > timeExpected * 2  ) return _adjustmentBlock.difficulty - 1;

        return _adjustmentBlock.difficulty;
    }   
}