export class TxIn {
    public txOutId: string;
    public txOutIndex: number;
    public sigature?: string;

    constructor( _txOutId: string,  _txOutIndex: number, _sigature: string | undefined = undefined ){
        this.txOutId = _txOutId;
        this.txOutIndex = _txOutIndex;
        this.sigature = _sigature;
    }

    static createTxIns(_receivedTx: any, _myUTXO: IUnspentTxOut[]){
        let sum = 0;
        let txIns: TxIn[] = [];

        for(let i=0; i < _myUTXO.length; i++){
            const {txOutId, txOutIndex, amount} = _myUTXO[i];
            const item: TxIn = new TxIn(txOutId, txOutIndex, _receivedTx.signature);

            txIns.push(item);
            sum += amount;

            if( sum >= _receivedTx.amount) return {sum, txIns};
        }

        return {sum, txIns};
    }
}