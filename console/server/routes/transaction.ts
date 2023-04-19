import { Router } from "express";
import qs from "qs";
import {Wallet} from '../../../wallet/wallet';

const router: Router = Router();

router.post('/', (req, res) => {
    const {
        sender: {account, publicKey},
        received,
        amount
    } = req.body;

    
});

export default router;