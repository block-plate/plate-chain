import { SHA256 } from 'crypto-js';
import elliptic from "elliptic";
import { UnspentTxOut } from './transaction/unspentTxOut';
import { Transaction } from './transaction/transaction';

const ec = new elliptic.ec("secp256k1");

export type Signature = elliptic.ec.Signature;

export interface ReceivedTx {
    sender: string;
    received: string;
    amount: number;
    signature: Signature;
}

export class Wallet {
    public publicKey: string;
    public account: string;
    public balance: number;
    public signature: Signature;

    constructor(_sender: string, _signature: Signature, _unspentTxOuts: IUnspentTxOut[]){
        this.publicKey = _sender;
        this.account = Wallet.getAccount(this.publicKey);
        this.balance = Wallet.getBalance(this.account, _unspentTxOuts);
        this.signature = _signature;
    }

    static getAccount(_publicKey: string): string {
        return Buffer.from(_publicKey).slice(26).toString();
    }

    static getVerify(_receivedTx: ReceivedTx): Failable<undefined, string> {
        
        const { sender, received, amount, signature } = _receivedTx;
        const data: [string, string, number] = [sender, received, amount];
        const hash: string = SHA256(data.join("")).toString();
        const keyPair = ec.keyFromPublic(sender, "hex");
        const isVerify = keyPair.verify(hash, signature);

        if(!isVerify) return {isError: true, error: "This is Not Verified Singature!" };
        
        return {isError: false, value: undefined};
    }

    static getBalance(_account: string, _unspentTxOuts: IUnspentTxOut[]): number {
        return _unspentTxOuts.filter((v) => {
            return v.account === _account
        }).reduce((acc, utxo) => {
            return (acc += utxo.amount);
        }, 0);
    }

    static sendTransaction(_receivedTx: any, _unspentTxOuts: IUnspentTxOut[]){
        
        const verify = Wallet.getVerify(_receivedTx);
        if(verify.isError) throw Error(verify.error);

        const myWallet = new this(_receivedTx.sender, _receivedTx.sigature, _unspentTxOuts);
        
        // if(myWallet.balance < _receivedTx.amount) throw new Error('not enough balance');

        const myUTXO: UnspentTxOut[] = UnspentTxOut.getMyUnspentTxOuts(myWallet.account, _unspentTxOuts);
        const tx: Transaction = Transaction.createTransaction(_receivedTx, myUTXO);
        
        return tx;
    }
    
}