import { Router } from "express";
import {Wallet} from '../../../src/wallet';
import { ReceivedTx } from "../../../src/wallet";
import {Wallet as W} from '../../../wallet/wallet';

const router: Router = Router();

router.post('/', (req: any, res) => {
    const {
        sender: {account, publicKey},
        received,
        amount
    } = req.body;

    const signature = W.createSign(req.body);

    const txObject = {
        sender: publicKey,
        received,
        amount,
        signature,
    }

    try{
        const receivedTx: ReceivedTx = txObject;

        const tx = Wallet.sendTransaction(receivedTx, req.sdk.getUnspentTxOuts());

        req.sdk.appendTransactionPool(tx);

        req.sdk.updateUTXO(tx);


    } catch(e){
        if( e instanceof Error){ 
            console.log(e.message);
            res.status(500).json({
                error: e.message
            });
        }
    }

    res.json({});
});

export default router;