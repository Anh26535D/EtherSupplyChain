import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    console.log('Deploying SupplyChain contract...')

    const [deployer] = await ethers.getSigners()
    const balance = await ethers.provider.getBalance(deployer.address)
    console.log('Deploying with account: address=', deployer.address, ' balance=', ethers.formatEther(balance), 'ETH')

    if (balance === 0n) {
        throw new Error('Account has no funds. Please fund the account or use a different account.')
    }

    const contractName = 'SupplyChain'
    const SupplyChain = await ethers.getContractFactory(contractName)
    const supplyChain = await SupplyChain.deploy()

    await supplyChain.waitForDeployment();
    const address = await supplyChain.getAddress();

    console.log(contractName, " deployed to:", address);

    const deploymentsDir = path.join(__dirname, "../../client/src");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const chainId = network.config.chainId || 1337;
    const deployments = {
        networks: {
            [chainId.toString()]: {
                [contractName]: {
                    "address": address
                }
            }
        }
    };

    fs.writeFileSync(
        path.join(deploymentsDir, "deployments.json"),
        JSON.stringify(deployments, null, 2)
    );

    const output = `Updated client deployments at ${path.join(deploymentsDir, "deployments.json")}\n`;
    fs.writeSync(1, output);
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
