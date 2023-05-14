import { Schema, getDefaultInstance, Ottoman } from "ottoman";

let ottoman = new Ottoman({ collectionName: '_default' });

const BlockSchema = new Schema({
    version: {type: String, require: true},
    height: Number,
    previousHash: String,
    timestamp: Number,
    merkleRoot: String,
    hash: String,
    difficulty: Number,
    nonce: Number,
    data: [
        {
            txIns: [{
                txOutId: String,
                txOutIndex: Number
            }],
            txOuts: [{
                account: String,
                amount: Number
            }],
            hash: String
        }
    ]
})

export const BlockModel = ottoman.model('Block', BlockSchema);