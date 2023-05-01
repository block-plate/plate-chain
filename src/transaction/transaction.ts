import { SHA256 } from "crypto-js";
import { TxIn } from "./txin";
import { TxOut } from "./txout";
import { UnspentTxOut } from "./unspentTxOut";

export class Transaction {
    public hash: string;
    public txIns: TxIn[];
    public txOuts: TxOut[];

    constructor(_txIns: TxIn[], _txOuts: TxOut[]){
        this.txIns = _txIns;
        this.txOuts = _txOuts;
        this.hash = this.createTransactionHash();
    }

    createTransactionHash(): string {
        const txoutContent: string = this.txIns.map((v) => Object.values(v).join('')).join('');
        const txinContent: string = this.txOuts.map((v) => Object.values(v).join('')).join('');

        console.log(txinContent, txoutContent);

        return SHA256(txinContent + txoutContent).toString();
    }

    createUTXO(): UnspentTxOut[] {
        const uxto: UnspentTxOut[] = this.txOuts.map((txOut: TxOut, index: number) => {
            return new UnspentTxOut(this.hash, index, txOut.account, txOut.amount);
        });

        return uxto;
    }

    static createTransaction(_receivedTx: any, _myUTXO: UnspentTxOut[]): Transaction {
        const { sum, txIns } = TxIn.createTxIns(_receivedTx, _myUTXO);
        const txOuts: TxOut[] = TxOut.createTxOuts(sum, _receivedTx);

        const tx = new Transaction(txIns, txOuts);

        return tx;
    }
}