// import { generateNextBlock, getGenesisBlock, isValidBlock } from "./blockChain";
import loggerSystem from "./config/logger";
import initKafka from "./kafka/initKafka";
import { Consumer, Producer } from "kafkajs";
import { db } from "./database/db";
import server from '../console/server'
import channel from '../console/channel'
import { getLength } from './blockChain';
import { Block } from "./blockchain/block";
import { DIFFICULTY_ADJUSTMENT_INTERVAL } from "./blockchain/genesis";

export default class {
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

    async sendNewBlock(data: any) {
        try {
          const previousBlock: Block = await this.db.getLeastBlock();
          const newblock = await Block.generateBlock(previousBlock, data);

          this.logger.info(`Building a block for the transaction ${newblock.height} sended.`);
          this.logger.debug('Built new block', newblock);
          // Publish block
          const topic = this.configs.kafka.topics.pending;
          await this.__produce(topic, newblock);
          // Return the new block
          return newblock.height;
        } catch(err) {
          this.logger.error(err);
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
      const currentLength = getLength(this.db);

      if(currentLength < DIFFICULTY_ADJUSTMENT_INTERVAL ){
        const adjustmentBlock: Block = Block.getGenesisBlock();

        return adjustmentBlock;

      } else {
        const adjustmentBlock = this.db.getBlockByHeight(currentLength - DIFFICULTY_ADJUSTMENT_INTERVAL);
        
        return adjustmentBlock;
      }
    }
}