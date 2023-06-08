import React, {useEffect, useState} from 'react';
import { Button, Dropdown, Input } from 'semantic-ui-react';
import styled from 'styled-components';
import Responsive from '../common/Responsive';
import { getWallet, getWallets } from '../../lib/api';
import useWallet from '../../hooks/wallet/useWallet';

const StyledWallet = styled.div`
    background-color: #F0F4FE;
    height: 100vh;
    header{
        padding: 1rem;
        background-color: white;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        img{
            width: 40rem;
        }
    }
    main{
        height: calc(100vh - 283px);
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        
        .card{
            width: 580px;
            color: black;
            background-color: white;
            padding: 2rem;
            border-radius: 24px;
            box-shadow: 0px 8px 40px rgba(0, 0, 0, 0.3);
        }
        .wallet-card{
            display: flex;
            flex-direction: column;
            justify-content: center;
            /* align-items: center; */
            img{
                height: 25px;
                margin-right: .5rem;
            }
            h1{
                display: flex;
                justify-content:center ;
                font-size: 2.25rem;
                margin-block-start: .5rem;
                align-items:center ;
                text-align: center;
                /* color: #98dad7; */
                span{
                    /* color: #98dad7; */
                }
            }
            label{ 
                margin-bottom: .5rem;
                font-size: 1.25rem;
                font-weight: bold;
            }
            p{
                font-size: 1.25rem;
            }
        }
        .send-box{
            margin-top: 1rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            /* align-items: center; */
        }
        .input + .input {
            margin-top: 1rem;
        }
        #amount{
            /* width: 50%; */
        }
        .button{
            margin-top: 1rem;
            background: #98dad7;
            color: #2A354E;
            &:hover{
                background: #7dc1be;    
            }
        }
    }
`

const Wallet = () => {
    const {walletOptions, wallet, handleSubmitTransaction, onSelectAccount, setReceived, setAmount, txId} = useWallet();

    return (
        <StyledWallet>
            <main>
            {/* <img src='/logo.png'></img> */}
                <h1>My PlateChain Wallet</h1>

                <div className='wallet-card card'>
                    <h3>Account</h3>
                    <Dropdown
                        placeholder='Select Account'
                        fluid
                        selection
                        options={walletOptions}
                        onChange={onSelectAccount}
                    />
                    <h1>{wallet.account ? <img src='/check-badge.svg'></img> : <span style={{width: '0'}}></span>}{Number(wallet.balance).toFixed(2)} <span>PTC</span></h1>
                </div>
                <div className='send-box card'>
                    <h3>Send Coin</h3>
                    <Input 
                        placeholder='public account(0x)' 
                        icon='check' 
                        onChange={(e) => setReceived(e.target.value)}
                        disabled={!wallet.account}
                        />
                    <Input 
                        placeholder='amount' 
                        id="amount" 
                        label={{ basic: true, content: 'PTC' }} 
                        onChange={(e) => setAmount(e.target.value)}
                        labelPosition='right' 
                        disabled={!wallet.account}
                        />
                    <Button disabled={!wallet.account} onClick={handleSubmitTransaction}>Submit</Button>
                    <Input disabled value={txId}></Input>
                </div>
            </main>
        </StyledWallet>
    )
}

export default Wallet;