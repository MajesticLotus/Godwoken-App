/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import './app.scss';
import 'react-toastify/dist/ReactToastify.css';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';

import { FirstFiveFactorsWrapper } from '../lib/contracts/FirstFiveFactorsWrapper';
import { CONFIG } from '../config';

async function createWeb3() {
    // Modern dapp browsers...
    if ((window as any).ethereum) {
        const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };

        const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new Web3(provider || Web3.givenProvider);

        try {
            // Request account access if needed
            await (window as any).ethereum.enable();
        } catch (error) {
            // User denied account access...
        }

        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [web3, setWeb3] = useState<Web3>(null);
    const [contract, setContract] = useState<FirstFiveFactorsWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [l2Balance, setL2Balance] = useState<bigint>();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = useState<string>();
    const [factorizedValue, setFactorizedValue] = useState<number | undefined>();
    const [deployTxHash, setDeployTxHash] = useState<string | undefined>();
    const [polyjuiceAddress, setPolyjuiceAddress] = useState<string | undefined>();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const [firstFactorValue, setFirstFactorValue] = useState<number | undefined>();
    const [secondFactorValue, setSecondFactorValue] = useState<number | undefined>();
    const [thirdFactorValue, setThirdFactorValue] = useState<number | undefined>();
    const [fourthFactorValue, setFourthFactorValue] = useState<number | undefined>();
    const [fifthFactorValue, setFifthFactorValue] = useState<number | undefined>();
    const toastId = React.useRef(null);
    const [newFactorizedNumberInputValue, setNewFactorizedNumberInputValue] = useState<
        number | undefined
    >();

    useEffect(() => {
        if (accounts?.[0]) {
            const addressTranslator = new AddressTranslator();
            setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0]));
        } else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts?.[0]]);

    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    const account = accounts?.[0];

    async function deployContract() {
        const _contract = new FirstFiveFactorsWrapper(web3);

        try {
            setDeployTxHash(undefined);
            setTransactionInProgress(true);

            const transactionHash = await _contract.deploy(account);

            setDeployTxHash(transactionHash);
            setExistingContractAddress(_contract.address);
            toast(
                'Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    async function getFirstFactor() {
        const firstvalue = await contract.getFirstFactor(account);
        toast('Got the first factor.', { type: 'success' });
        setFirstFactorValue(firstvalue);
    }

    async function getSecondFactor() {
        const secondvalue = await contract.getSecondFactor(account);
        toast('Got the second factor.', { type: 'success' });
        setSecondFactorValue(secondvalue);
    }

    async function getThirdFactor() {
        const thirdvalue = await contract.getThirdFactor(account);
        toast('Got the third factor.', { type: 'success' });
        setThirdFactorValue(thirdvalue);
    }

    async function getFourthFactor() {
        const fourthvalue = await contract.getFourthFactor(account);
        toast('Got the fourth factor.', { type: 'success' });
        setFourthFactorValue(fourthvalue);
    }

    async function getFifthFactor() {
        const fifthvalue = await contract.getFifthFactor(account);
        toast('Got the fifth factor.', { type: 'success' });
        setFifthFactorValue(fifthvalue);
    }

    async function setExistingContractAddress(contractAddress: string) {
        const _contract = new FirstFiveFactorsWrapper(web3);
        _contract.useDeployed(contractAddress.trim());

        setContract(_contract);
        setFactorizedValue(undefined);
        setFirstFactorValue(undefined);
        setSecondFactorValue(undefined);
        setThirdFactorValue(undefined);
        setFourthFactorValue(undefined);
        setFifthFactorValue(undefined);
    }

    async function setNewFactorizedValue() {
        try {
            setTransactionInProgress(true);
            await contract.factorizeValue(newFactorizedNumberInputValue, account);
            toast(
                'Successfully factorized a new value!',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });

            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
            }
        })();
    });

    const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

    return (
        <div>
            Your ETH address: <b>{accounts?.[0]}</b>
            <br />
            <br />
            Your Polyjuice address: <b>{polyjuiceAddress || ' - '}</b>
            <br />
            <br />
            Nervos Layer 2 balance:{' '}
            <b>{l2Balance ? (l2Balance / 10n ** 8n).toString() : <LoadingIndicator />} CKB</b>
            <br />
            <br />
            Deployed contract address: <b>{contract?.address || '-'}</b> <br />
            Deploy transaction hash: <b>{deployTxHash || '-'}</b>
            <br />
            <hr />
            <p>
                Will deploy a first five factors contract that finds the first five factors or less of a number.
            </p>
            <button onClick={deployContract} disabled={!l2Balance}>
                Deploy contract
            </button>
            &nbsp;or&nbsp;
            <input
                placeholder="Existing contract id"
                onChange={e => setExistingContractIdInputValue(e.target.value)}
            />
            <button
                disabled={!existingContractIdInputValue || !l2Balance}
                onClick={() => setExistingContractAddress(existingContractIdInputValue)}
            >
                Use existing contract
            </button>
            <br />
            <br />

            <input
                type="number"
                onChange={e => setNewFactorizedNumberInputValue(parseInt(e.target.value, 10))}
            />
            <button onClick={setNewFactorizedValue} disabled={!contract}>
                Set new factorized value
            </button>
            <br />
            <br />
            <button onClick={getFirstFactor} disabled={!contract}>
            Get the first factor.
            </button>
            {firstFactorValue}
            <br/>
            <br/>
            <button onClick={getSecondFactor} disabled={!contract}>
            Get the second factor.
            </button>
            {secondFactorValue}
            <br/>
            <br/>
            <button onClick={getThirdFactor} disabled={!contract}>
            Get the third Factor.
            </button>
            {thirdFactorValue}
            <br/>
            <br/>
            <button onClick={getFourthFactor} disabled={!contract}>
            Get the fourth factor.
            </button>
            {fourthFactorValue}
            <br/>
            <br/>
            <button onClick={getFifthFactor} disabled={!contract}>
            Get the fifth factor.
            </button>
            {fifthFactorValue}
            <br />
            <br />
            <hr />
            The contract is deployed on Nervos Layer 2 - Godwoken + Polyjuice. After each
            transaction you might need to wait up to 120 seconds for the status to be reflected.
            <ToastContainer />
        </div>
    );
}
