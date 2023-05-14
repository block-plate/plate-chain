import { Ottoman, start, close, Query } from "ottoman";
import { Block } from "../blockchain/block"
import { BlockModel } from "./BlockModel";

export default class {
    ottoman: Ottoman;

    constructor(ottoman: Ottoman){
        this.ottoman = ottoman;
    }
    
    async getBlocks(): Promise<any> {
        try{
            const data = await BlockModel.find({}, {sort:{timestamp: 'ASC'}});
            
            return data;
        } catch(error){
            console.log(error);
        }
    }

    async getBlockByHeight(height: number): Promise<any> {
        try{
            const data = await BlockModel.find({height});
            
            return data;
        } catch(error){
            console.log(error);
        }
    }
    async getBlock(user?: string, offset?: number, limit?: number): Promise<any>{
        try{
            if(!user){
                const data = await BlockModel.find();
                return data;
            }
            const query = new Query({}, 'test-bucket t')
                            .select('t.*')
                            .where({ '`data`.`user`': user })
                            .offset(offset ?? 0)
                            .limit(limit ?? 10)
                            .build();
            const {rows} = await this.ottoman.query(query);
            return rows; 
        }catch(e){
            console.log(e);
            
        }
    }

    async getLeastBlock(): Promise<any>{
        const data = await BlockModel.findOne({}, {sort:{timestamp: 'DESC'}})

        return data;
    }
    
    async addBlock(block: Block){

        const myBlock = new BlockModel(block);
        console.log(block);
        const runAsync = async () => {
            console.log('saving...');
            await myBlock.save();
            console.log(`SUCCESS: user ${block.height} added!`);
        }
          
        this.ottoman.start()
            .then(runAsync)
            .catch((error) => console.log(error))
        
    }
}