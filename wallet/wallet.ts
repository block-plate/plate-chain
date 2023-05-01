import elliptic from 'elliptic';
import {SHA256} from 'crypto-js';
import fs from 'fs';
import path from 'path';

const crypto = require("crypto");
const dir = path.join(__dirname, "../data");

const ec = new elliptic.ec("secp256k1");

export class Wallet {
    public account: string;
    public privateKey: string;
    public publicKey: string;
    public balance: number;

    constructor(_privateKey: string = ""){
        this.privateKey = _privateKey || this.getPrivateKey();
        this.publicKey = this.getPublicKey();
        this.account = this.getAccount();
        this.balance = 0;

        Wallet.createWallet(this);
    }  

    static createWallet(myWallet: Wallet){
        const filename = path.join(dir, myWallet.account);

        const filecontent = myWallet.privateKey;
        !fs.existsSync(dir) && fs.mkdirSync(dir);
        
        fs.writeFileSync(filename, filecontent);
    }

    public getPrivateKey(): string {
        const keyPair = ec.genKeyPair();
        const privateKey = keyPair.getPrivate();

        return privateKey.toString();
    }

    public getPublicKey(): string {
        const keyPair = ec.keyFromPrivate(this.privateKey);

        return keyPair.getPublic().encode("hex", true);
    }

    public getAccount(): string {
        return Buffer.from(this.publicKey).slice(26).toString();
    }

    static getWalletList(): string[] {
        const files: string[] = fs.readdirSync(dir);
        return files;
    }

    static getWalletPrivateKey(_account: string): string {
        const filepath = path.join(dir, _account);

        const filecontent = fs.readFileSync(filepath);

        return filecontent.toString();
    }

    static createSign(_obj: any): elliptic.ec.Signature {
        const {
            sender: {account, publicKey},
            received,
            amount
        } = _obj;

        const hash: string = SHA256([publicKey, received, amount].join('')).toString();

        const privateKey: string = Wallet.getWalletPrivateKey(account);

        const keyPair: elliptic.ec.KeyPair = ec.keyFromPrivate(privateKey);

        return keyPair.sign(hash, "hex");
    }
}