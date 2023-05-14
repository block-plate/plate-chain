// import { generateNextBlock, getGenesisBlock, isValidBlock } from "./blockChain";
import loggerSystem from "./config/logger";
import initKafka from "./kafka/initKafka";
import { Consumer, Producer } from "kafkajs";
import { db } from "./database/db";
import server from '../console/server'
import channel from '../console/channel'
import { getLength } from './blockchain/blockChain';
import { Block } from "./blockchain/block";
import { DIFFICULTY_ADJUSTMENT_INTERVAL } from "./blockchain/genesis";
import { TxIn } from "./transaction/txin";
import { TxOut } from "./transaction/txout";
import { Transaction } from "./transaction/transaction";
import { UnspentTxOut } from "./transaction/unspentTxOut";

export default class {
    unspentTxOuts: IUnspentTxOut[];
    transactionPools: ITransaction[];
    consumer!: Consumer
    producer!: Producer
    logger: any;
    configs: any;
    db: any;
    server: any;

    constructor(configs: any){
        const { role, id, logs } = configs;
        this.configs = configs;
        this.logger = loggerSystem(role, id, logs.level, logs.path, logs.console);
        this.unspentTxOuts = [];
        this.transactionPools = [];
    }

    async start() {
        try{
            const {role, id, webconsole} = this.configs;
            if(role === 'peer'){
              const {consumer, producer} = await initKafka(this);
              this.db = await db(this.configs.db, this.logger);
              this.server = await server(this.configs, this, this.db);
              this.consumer = consumer;
              this.producer = producer;
              await this.initBlockchain();
            }
            else if(role === 'channel'){
              this.server = await channel(this.configs);
            }
            this.logger.info(`The ${role} with id ${id} is ready.`);
        }catch(err){
            this.logger.error(err);
        }
    }

    async initBlockchain() {
      try{
        const {rows} = await this.db.getBlock();
        console.log(rows);
        // Blockchain이 비어있다면
      if(rows.length === 0 ){ 
          const genesisBlock = Block.getGenesisBlock();
          await this.db.addBlock(genesisBlock);
          this.logger.info("Add Genesis Block!");
        }
      }catch(err){
        console.log("init error: " + err);
      }
    }

    private serialize(block:Block) {
        return JSON.stringify(block);
    }

    private deserialize(data: string):Block {
        return JSON.parse(data);
    }

    hasRole(r:string) {
        const { role } = this.configs;
        return role === r;
    }

    async addBlockToLedger(newBlock: Block) {
       //TODO: Block 추가시 바로 추가 안되도록 변경
        try {
          const previousBlock: Block = await this.db.getLeastBlock();
          
          newBlock.data.forEach((_tx: ITransaction) => {
            this.updataUTXO(_tx);
          });

          this.updateTransactionPool(newBlock);
          
          const valid = Block.isValidNewBlock(newBlock, previousBlock);
          if (!valid) {
            const invalidMsg = (newBlock && newBlock.height) ? `Skipping invalid block ${newBlock.height}.` : 'Skipping an invalid block.';
            this.logger.error(invalidMsg);
            return false;
          }
          this.logger.debug(`Received block ${newBlock.height}.`);
          // Store block on db
          await this.db.addBlock(newBlock);
          this.logger.info(`Added new block ${newBlock.height}.`);
          this.logger.debug('Added new block', newBlock.height);
          // Return the new block
          return newBlock.height
        } catch(err) {
          this.logger.error(err);
        }
      }

    async onMessage(topic:any, data: string) {
        const { topics } = this.configs.kafka;
        const block = this.deserialize(data);
        switch(topic) {
          case topics.pending:
            if (this.hasRole('peer')) {
              return await this.addBlockToLedger(block);
            }
            return false;
          default:
            throw Error('Received message of an invalid topic');
        }
    }

    async sendNewBlock(data: ITransaction[]): Promise<Failable<Block, string>> {
        try {
          const previousBlock: Block = await this.db.getLeastBlock();
          const adjustmentBlock: Block = await this.getAdjustmentBlock();

          const newblock = await Block.generateBlock(previousBlock, data, adjustmentBlock);
          
          newblock.data.forEach((_tx: ITransaction) => {
            this.updataUTXO(_tx);
          });

          this.updateTransactionPool(newblock);

          this.logger.info(`Building a block for the transaction ${newblock.height} sended.`);
          this.logger.debug('Built new block', newblock);
          // Publish block
          const topic = this.configs.kafka.topics.pending;
          await this.__produce(topic, newblock);
          // Return the new block
          return {isError: false, value: newblock};
        } catch(err) {
          this.logger.error(err);
          return {isError: true, error: 'Unknown erorr'}
        }
    }

    
    async __produce(topic: string, block: Block) {
        try {
            const serialized = this.serialize(block);

            return this.producer.send({
                topic: topic,
                messages: [
                  { value: serialized },
                ],
            })
        } catch(err) {
            this.logger.error(err);
        }
    }

    async getAdjustmentBlock() {
      const currentLength = await getLength(this.db);

      if(currentLength < DIFFICULTY_ADJUSTMENT_INTERVAL ){
        const adjustmentBlock: Block = Block.getGenesisBlock();

        return adjustmentBlock;

      } else {
        const adjustmentBlock: Block = this.db.getBlockByHeight(currentLength - DIFFICULTY_ADJUSTMENT_INTERVAL);
        
        return adjustmentBlock;
      }
    }

    appendUTXO(utxo: IUnspentTxOut[]): void{
      this.unspentTxOuts.push(...utxo);
    }

    appendTransactionPool(_transaction: ITransaction): void{
      this.transactionPools.push(_transaction);
    }

    getUnspentTxOuts(): UnspentTxOut[]{
      return this.unspentTxOuts;
    }

    updateUTXO(_tx: ITransaction): void {
      const unspentTxOuts: UnspentTxOut[] = this.getUnspentTxOuts();

      const newUnspendTxOuts = _tx.txOuts.map((txout, index) => {
        return new UnspentTxOut(_tx.hash, index, txout.account, txout.amount);
      })

      const tmp = unspentTxOuts.filter((_v: UnspentTxOut) => {
        const bool = _tx.txIns.find((v: TxIn) => {
          return _v.txOutId === v.txOutId && _v.txOutIndex === v.txOutIndex;
        });

        return !bool;
      }).concat(newUnspendTxOuts);

      let unspentTmp: UnspentTxOut[] = [];
      const result = tmp.reduce((acc, utxo) => {
        const find = acc.find(({txOutId, txOutIndex}) => {
          return txOutId === utxo.txOutId && txOutIndex === utxo.txOutIndex
        });

        if(!find) acc.push(utxo);
        return acc;
      }, unspentTmp);

      this.unspentTxOuts = result;
    }

    updateTransactionPool(_newBlock: IBlock){
      let txPool: ITransaction[] = this.transactionPools;

      _newBlock.data.forEach((tx: ITransaction) => {
        txPool = txPool.filter((txp) => {
          txp.hash !== tx.hash;
        });
      });

      this.transactionPools = txPool;
    }

    async miningBlock(_account: string): Promise<Failable<Block, string>> {
      const leastBlock = this.db.getLeastBlock();

      const txin: ITxIn = new TxIn('', leastBlock.height + 1);
      const txout: ITxOut = new TxOut(_account, 50);
      const coinbaseTransaction: Transaction = new Transaction([txin], [txout]);
      // const utxo = coinbaseTransaction.createUTXO();
      // this.appendUTXO(utxo);

      return await this.sendNewBlock([coinbaseTransaction]);
    }

    updataUTXO(_tx: ITransaction): void {
      const unspentTxOuts: UnspentTxOut[] = this.unspentTxOuts;

      const newUnspendTxOuts = _tx.txOuts.map((txOut, index) => {
        return new UnspentTxOut(_tx.hash, index, txOut.account, txOut.amount);
      });

      const tmp = unspentTxOuts.filter((_v: UnspentTxOut) => {
        const bool = _tx.txIns.find((v: TxIn) => {
          return _v.txOutId === v.txOutId && _v.txOutIndex === v.txOutIndex;
        });

        return !bool;
      }).concat(newUnspendTxOuts);

      let unspentTmp: UnspentTxOut[] = [];
      const result = tmp.reduce((acc, utxo) => {
        const find = acc.find(({ txOutId, txOutIndex}) => {
          return txOutId === utxo.txOutId && txOutIndex === utxo.txOutIndex;
        });
        if(!find) acc.push(utxo);
        return acc;
      }, unspentTmp);

      this.unspentTxOuts = result;
    }
}