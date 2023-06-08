import react, {useCallback, useEffect, useState} from 'react';
import { getWallet, getWallets, sendTransaction } from '../../lib/api';
import { useRouter } from '../common/useRouter';
import { toast } from 'react-toastify';

export default function useWallet(){
    const [walletOptions, setWalletOptions] = useState([]);
    const [wallet, setWallet] = useState({
        publicKey: null,
        privateKey: null,
        account: null,
        balance: 0,
    });
    const [amount, setAmount] = useState<string>()
    const [received, setReceived] = useState<string>();
    const [txId, setTxId] = useState();

    const getWalletList = async() => {
        const wallets = await getWallets();

        const ws = wallets.data.map((w) => {
            return {
                text: w,
                value: w,
                key: w
            }
        })

        setWalletOptions(ws);
    }

    const onSelectAccount = async(e, {value}: any) => {
        try{
            const {data} = await getWallet(value);
            setWallet(data);
        } catch(err){
            toast.error(`Not Found:  ${value}`);
        }
    }  

    const handleSubmitTransaction = async() => {
        if(!received){
            toast.warn('Please Enter to Recevied Account')
            return;
        }
        if(!amount){
            toast.warn('Please Enter to Amount')
            return;
        }
        
        const data =  {
            sender:{
                publicKey: wallet.publicKey,
                account: wallet.account,
            },
            received,
            amount: Number(amount),
        }
        
        try{
            const response = await sendTransaction(data);
            toast.success("Success to Send PTC");
            console.log(response.data.tx);
            setTxId(response.data.tx.hash);
        } catch (err){
            if('response' in (err as any)){
                toast.error((err as any).response.data.error);
            }
            else{
                toast.error('Fail to Send Transaction!');
            }
        }
    }

    useEffect(() => {
        getWalletList();
    }, []);

    return {
        walletOptions, wallet, handleSubmitTransaction, onSelectAccount, setReceived, setAmount, txId
    }
}