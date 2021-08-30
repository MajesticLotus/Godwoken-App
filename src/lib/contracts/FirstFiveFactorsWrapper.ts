import Web3 from 'web3';
import * as FirstFiveFactorsJSON from '../../../build/contracts/FirstFiveFactors.json';
import { FirstFiveFactors } from '../../types/FirstFiveFactors';

const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};

export class FirstFiveFactorsWrapper {
    web3: Web3;

    contract: FirstFiveFactors;

    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(FirstFiveFactorsJSON.abi as any) as any;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getFirstFactor(fromAddress: string) {
        const data = await this.contract.methods.firstFactor().call({ from: fromAddress });

        return parseInt(data, 10);
    }

    async getSecondFactor(fromAddress: string) {
        const data = await this.contract.methods.secondFactor().call({ from: fromAddress });

        return parseInt(data, 10);
    }

    async getThirdFactor(fromAddress: string) {
        const data = await this.contract.methods.thirdFactor().call({ from: fromAddress });

        return parseInt(data, 10);
    }

    async getFourthFactor(fromAddress: string) {
        const data = await this.contract.methods.fourthFactor().call({ from: fromAddress });

        return parseInt(data, 10);
    }

    async getFifthFactor(fromAddress: string) {
        const data = await this.contract.methods.fifthFactor().call({ from: fromAddress });

        return parseInt(data, 10);
    }

    async factorizeValue(value: number, fromAddress: string) {
        const tx = await this.contract.methods.factorize(value).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress,
            value
        });

        return tx;
    }

    async deploy(fromAddress: string) {
        const tx = this.contract
            .deploy({
                data: FirstFiveFactorsJSON.bytecode,
                arguments: []
            })
            .send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress
            });

        let transactionHash: string = null;
        tx.on('transactionHash', (hash: string) => {
            transactionHash = hash;
        });

        const contract = await tx;

        this.useDeployed(contract.options.address);

        return transactionHash;
    }

    useDeployed(contractAddress: string) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}
