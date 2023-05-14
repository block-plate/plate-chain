import { Router } from "express";
import qs from "qs";
import {Wallet} from '../../../wallet/wallet';
import {Wallet as W} from '../../../src/wallet';
import request from 'request';

const router: Router = Router();

router.post('/', (req, res) => {
    res.json(new Wallet());
});

router.get('/', (req, res) => {
    const list = Wallet.getWalletList();
    res.json(list);
})

router.get('/:account', async(req: any, res) => {
    const {account} = req.params;
    
    console.log("Wallet account: ", account);

    const privateKey = Wallet.getWalletPrivateKey(account);

    const myWallet = new Wallet(privateKey);
    
    console.log(req.sdk.getUnspentTxOuts());
    const balance = W.getBalance(account, req.sdk.getUnspentTxOuts());
    myWallet.balance = balance;

    res.json(myWallet);
});


export default router;