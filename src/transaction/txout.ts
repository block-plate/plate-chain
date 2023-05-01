import { Wallet } from "../wallet";
import { TxIn } from "./txin";

export class TxOut{
    public account: string;
    public amount: number;

    constructor(_account: string, _amout: number){
        this.account = _account;
        this.amount = _amout;
    }

    static createTxOuts(_sum: number, _receivedTx: any): TxOut[] {
        const { sender, received, amount } = _receivedTx;
        const senderAccount: string = Wallet.getAccount(sender);

        const receivedTxOut = new TxOut(received, amount);
        const senderTxOut = new TxOut(senderAccount, _sum - amount);

        if(senderTxOut.amount <= 0) return [receivedTxOut];

        return [receivedTxOut, senderTxOut];
    }
}