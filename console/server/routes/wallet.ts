import { Router } from "express";
import qs from "qs";
import {Wallet} from '../../../wallet/wallet';

const router: Router = Router();

router.post('/', (req, res) => {
    res.json(new Wallet());
});

router.get('/', (req, res) => {
    const list = Wallet.getWalletList();
    res.json(list);
})

router.get('/:account', (req, res) => {
    const {account} = req.params;
    
    console.log("Wallet account: ", account);

    const privateKey = Wallet.getWalletPrivateKey(account);

    res.json(new Wallet(privateKey));
})


export default router;