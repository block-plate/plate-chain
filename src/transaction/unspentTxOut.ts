export class UnspentTxOut{
    public txOutId: string;
    public txOutIndex: number;
    public account: string;
    public amount: number;

    constructor(_txOutId: string, _txOutIndex: number, _account: string, _amount: number ){
        this.txOutId = _txOutId;
        this.txOutIndex = _txOutIndex;
        this.account = _account;
        this.amount = _amount;
    }

    // 전체 UTXO에서 내 계정의 UTXO만 들고온다.
    static getMyUnspentTxOuts(_account: string, _unspentTxOuts: UnspentTxOut[]): UnspentTxOut[] {
        return _unspentTxOuts.filter((uxto: UnspentTxOut) => {
            return uxto.account === _account;
        })
    }
}