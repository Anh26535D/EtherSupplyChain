import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    console.log('Deploying SupplyChain contract...')

    const [deployer] = await ethers.getSigners()
    console.log('Deploying with account:', deployer.address)

    const balance = await ethers.provider.getBalance(deployer.address)
    console.log('Account balance:', ethers.formatEther(balance), 'ETH')

    if (balance === 0n) {
        throw new Error('Account has no funds. Please fund the account or use a different account.')
    }

    const SupplyChain = await ethers.getContractFactory('SupplyChain')
    const supplyChain = await SupplyChain.deploy()

    await supplyChain.waitForDeployment();
    const address = await supplyChain.getAddress();

    console.log("SupplyChain deployed to:", address);

    // Update backend config
    // Note: hardhat.config.ts might be using a different path logic, but sticking to the request context:
    // We need to write to client/src/deployments.json which is ../client/src/deployments.json relative to backend

    const deploymentsDir = path.join(__dirname, "../../client/src");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deployments = {
        networks: {
            "1337": {
                "SupplyChain": {
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
