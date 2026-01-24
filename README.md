# 🔗 Supply Chain Blockchain DApp

<div align="center">

![Supply Chain Blockchain](https://www.mdpi.com/logistics/logistics-03-00005/article_deploy/html/images/logistics-03-00005-g001.png)

**A decentralized supply chain management system built on Ethereum blockchain using Solidity smart contracts, Next.js, and Web3.js**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-FFF1E2?logo=hardhat&logoColor=black)](https://hardhat.org/)

[⭐ Star](https://github.com/faizack619/Supply-Chain-Blockchain) • [🍴 Fork](https://github.com/faizack619/Supply-Chain-Blockchain/fork) • [🐛 Report Bug](https://github.com/faizack619/Supply-Chain-Blockchain/issues) • [💡 Request Feature](https://github.com/faizack619/Supply-Chain-Blockchain/issues)

</div>

---

<!--
## 🎥 Demo

Watch the demo video: [Canva Design Demo](https://www.canva.com/design/DAFb-i9v_cM/-fK0pKTuOkFq5dfCPQxh_w/watch?utm_content=DAFb-i9v_cM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink)
-->

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Running the Project](#-running-the-project)
- [Usage Guide](#-usage-guide)
- [Smart Contract Details](#-smart-contract-details)
- [License](#-license)

## 🎯 Overview

**Supply Chain Blockchain DApp** is a comprehensive decentralized application that leverages blockchain technology to create a transparent, secure, and efficient supply chain management system. This project demonstrates how smart contracts can revolutionize traditional supply chain processes by eliminating paperwork, increasing transparency, and building a robust Root of Trust.

### Key Benefits

- ✅ **Transparency**: All transactions and product movements are recorded on the blockchain
- ✅ **Security**: Immutable records prevent tampering and fraud
- ✅ **Efficiency**: Automated processes reduce administrative overhead
- ✅ **Traceability**: Complete product journey from raw materials to consumer
- ✅ **Decentralization**: No single point of failure

## ✨ Features

- 🔐 **Role-Based Access Control**: Secure role assignment (Owner, Raw Material Supplier, Manufacturer, Distributor, Retailer)
- 📦 **Product Management**: Add and track products through the entire supply chain
- 🔄 **Supply Chain Flow**: Manage product stages (Order → Raw Material Supply → Manufacturing → Distribution → Retail → Sold)
- 📊 **Real-Time Tracking**: Track products with detailed stage information and QR codes
- 🎨 **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- 🐞 **Transaction Debugger**: Toggleable debug mode for detailed transaction logs and gas fee monitoring
- 🔗 **Web3 Integration**: Seamless connection with MetaMask wallet
- 📱 **Mobile Responsive**: Works perfectly on all devices

## 🛠 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Web3.js** - Ethereum blockchain interaction
- **QRCode.react** - QR code generation for product tracking

### Backend/Blockchain
- **Solidity ^0.8.19** - Smart contract programming language
- **Hardhat** - Ethereum development environment

- **MetaMask** - Web3 wallet integration

### Development Tools
- **Node.js 18+** - JavaScript runtime
- **npm** - Package management
- **Git** - Version control

## 🏗 Architecture

The application follows a decentralized architecture where:

1. **Smart Contracts** (Solidity) handle all business logic and data storage on the blockchain
2. **Frontend** (Next.js) provides the user interface and interacts with the blockchain via Web3.js
3. **MetaMask** acts as the bridge between users and the Ethereum network


### System Flow

```
User → Next.js Frontend → Web3.js → MetaMask → Ethereum Network → Smart Contract
```

![Architecture Diagram](https://raw.githubusercontent.com/faizack619/Supply-Chain-Gode-Blockchain/master/client/public/Blank%20diagram.png)

### Supply Chain Flow

The product journey through the supply chain:

```
Order → Raw Material Supplier → Manufacturer → Distributor → Retailer → Consumer
```

![Supply Chain Flow](https://cdn-wordpress-info.futurelearn.com/info/wp-content/uploads/8d54ad89-e86f-4d7c-8208-74455976a4a9-2-768x489.png)

## 📦 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/downloads)

- **MetaMask** - [Chrome Extension](https://chrome.google.com/webstore/detail/metamask) | [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/)
- **VS Code** (Recommended) - [Download](https://code.visualstudio.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Anh26535D/EtherSupplyChain.git
cd Supply-Chain-Blockchain
```

### Step 2: Install Dependencies

Install root dependencies (for Hardhat):

```bash
cd backend
npm install
cd ..
```

Install client dependencies:

```bash
cd client
npm install
cd ..
```

### Step 3: Start Local Node

Start a local Hardhat node:

```bash
cd backend
npx hardhat node
```

This will start a local blockchain at `http://127.0.0.1:8545` with Chain ID `1337`.

### Step 5: Deploy Smart Contracts

Compile the smart contracts:

```bash
npx hardhat compile
```

Deploy to Localhost:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

The deployment script will automatically update `client/src/deployments.json` with the contract address.

### Step 4: Configure MetaMask

1. Open MetaMask and click the network dropdown
2. Select "Add Network" → "Add a network manually"
3. Enter the following details:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: ETH
4. Click "Save"

5. Import an account from Hardhat Node:
   - Copy one of the private keys displayed in the terminal where you started `npx hardhat node`
   - In MetaMask, click the account icon → "Import Account"
   - Paste the private key and click "Import"

## 🚀 Running the Project

### Start Local Node

```bash
cd backend
npx hardhat node
```

### Deploy Contracts (if not already deployed)

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

### Start the Frontend

```bash
cd client
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
cd client
npm run build
npm start
```

## 📖 Usage Guide

### 1. Register Roles

- Navigate to "Register Roles" page
- Only the contract owner can register new roles
- Add participants: Raw Material Suppliers, Manufacturers, Distributors, and Retailers
- Each role requires: Ethereum address, name, and location

### 2. Order Materials

- Go to "Order Materials" page
- Only the contract owner can create orders
- Enter product details: ID, name, and description
- Ensure at least one participant of each role is registered

### 3. Step-by-Step Walkthrough (Normal Case)
Follow this exact sequence to simulate a complete product lifecycle:

#### Phase 1: Preparation (Owner)
1.  **Register Roles**: Go to "Register Roles". Register distinct accounts for RMS (`Account 2`), Manufacturer (`Account 3`), Distributor (`Account 4`), and Retailer (`Account 5`).
2.  **Order Item**: Go to "Order Materials". Create a new order (ID: `1`, Name: `Battery`). Item Stage: **Ordered**.

#### Phase 2: Raw Material Supply (RMS)
3.  **Switch to RMS Account** (`Account 2`).
4.  Go to **Supply Chain Flow**.
5.  In the left panel ("Supply New Material"), enter ID: `1` and Price: `2` ETH. Click **Supply**.
6.  Item Stage: **Raw Material Supply**. Status: Listing for 2 ETH.

#### Phase 3: Manufacturing (Manufacturer)
7.  **Switch to Manufacturer Account** (`Account 3`).
8.  In the "Marketplace" table, click **"Buy (Man)"**. Confirm the transaction (pays 2 ETH).
    - *Funds are now locked in the Smart Contract.*
9.  **Confirm Receipt**: In the table, click **"Confirm Receipt"** when the button appears pulsing blue.
    - *Funds are released to RMS.*
10. **Listing**: Scroll down to the "List for Sale" card. Enter ID: `1` and New Price: `4` ETH. Click **Set Price**.
11. Item Stage: **Manufacture**. Status: Listing for 4 ETH.

#### Phase 4: Distribution (Distributor)
12. **Switch to Distributor Account** (`Account 4`).
13. Click **"Buy (Dis)"** (pays 4 ETH).
14. Click **"Confirm Receipt"** (releases 4 ETH to Man).
15. **Listing**: Set New Price: `6` ETH.
16. Item Stage: **Distribution**. Status: Listing for 6 ETH.

#### Phase 5: Retail (Retailer)
17. **Switch to Retailer Account** (`Account 5`).
18. Click **"Buy (Ret)"** (pays 6 ETH).
19. Click **"Confirm Receipt"** (releases 6 ETH to Dis).
20. **Listing**: Set New Price: `8` ETH.
21. Item Stage: **Retail**. Status: Listing for 8 ETH.

#### Phase 6: Consumption (Consumer)
22. **Switch to any Consumer Account** (`Account 6`).
23. Click **"Buy (Cons)"** (pays 8 ETH).
24. Item Stage: **Sold**. Cycle Complete. Only "Confirm Receipt" is needed if you want to release funds to Retailer, though consumer goods assume finality.



### 4. My Inventory & Actions (Critical!)
After purchasing an item, it moves to your **Inventory** (visible at the bottom of the Supply page). You MUST perform these actions to proceed:

#### A. Confirm Receipt (Releases Funds)
- **Role**: Buyer
- **Action**: Once you receive the physical goods, click **"Confirm Receipt"**.
- **Result**: This releases the locked ETH from the contract to the Seller. The item is now fully yours.

#### B. Set Selling Price (Lists Item)
- **Role**: Seller (Current Owner)
- **Action**: After confirming receipt, set a new **Selling Price** for the next buyer.
- **Result**: The item becomes available for purchase by the next role in the chain.

#### C. Raise Dispute (Locks Funds)
- **Role**: Buyer
- **When**: If goods are defective, missing, or fake.
- **Action**: Click **"Raise Dispute"** and provide a reason.
- **Result**: Funds remain locked in the contract. The Seller cannot receive payment until resolved.

#### D. Resolve Dispute (Admin Only)
- **Role**: Contract Owner
- **Action**: Review the case and decide to either:
    - **Refund Buyer**: Return 100% of the funds to the Buyer.
    - **Pay Seller**: Rule in favor of the Seller and release funds.

### 5. Track Products
- Visit "Track Materials" page
- Enter a product ID to view its complete journey
- View detailed information about each stage
- Generate QR codes for product verification

## 🔐 Smart Contract Details

The `SupplyChain.sol` smart contract implements a comprehensive supply chain management system with the following features:

### Roles
- **Owner**: Deploys the contract and can register other roles
- **Raw Material Supplier (RMS)**: Supplies raw materials
- **Manufacturer (MAN)**: Manufactures products
- **Distributor (DIS)**: Distributes products
- **Retailer (RET)**: Sells products to consumers

### Product Stages
1. **Ordered** (Stage 0): Product order created
2. **Raw Material Supplied** (Stage 1): Raw materials supplied
3. **Manufacturing** (Stage 2): Product being manufactured
4. **Distribution** (Stage 3): Product in distribution
5. **Retail** (Stage 4): Product at retailer
6. **Sold** (Stage 5): Product sold to consumer

### Key Functions
- `addRMS()`, `addManufacturer()`, `addDistributor()`, `addRetailer()`: Register participants
- `addMedicine()`: Create new product orders
- `supplyRawMaterial(id, price)`: List initial item
- `purchaseItem(id)`: Payable function to buy item and advance stage
- `confirmReceived(id)`: Release Escrow funds to seller
- `setPrice(id, price)`: List item for next sale
- `raiseDispute()`, `resolveDispute()`: Handle transaction disputes

![Smart Contract Flow](https://raw.githubusercontent.com/faizack619/Supply-Chain-Gode-Blockchain/master/client/public/Supply%20Chain%20Design%20(1).png)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

### External Resources

- [Solidity Documentation](https://docs.soliditylang.org/en/v0.8.19/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Web3.js Documentation](https://web3js.readthedocs.io/)

- [MetaMask Documentation](https://docs.metamask.io/)



### 6. Transaction Debugging
- Enable **Debug Mode** using the checkbox on the "Supply Chain Flow" page.
- Open the browser console (F12) to view detailed logs:
  - Pre-transaction balances
  - Gas usage and costs
  - Net balance changes
- This is useful for verifying financial flows and ensuring correct payments.

## ❓ Troubleshooting

### Common Issues

#### 1. "Transaction gas limit exceeds gas cap" or "Transaction reverted"
- **Cause**: Often caused by invalid state (e.g., trying to supply materials for an ID that doesn't exist) or old artifacts.
- **Fix**: 
  - Ensure you are registered for the correct role.
  - Check that the product ID exists and is in the correct stage.
  - Reset MetaMask account: **Settings > Advanced > Clear Activity Tab Data**.

#### 2. "Unrecognized selector"
- **Cause**: ABI mismatch. The frontend is trying to call a function signature that the deployed contract contract doesn't have (often happens after updating Smart Contract arguments).
- **Fix**:
  - Restart the Hardhat node and redeploy contracts.
  - Ensure `client/src/artifacts` is updated using `npx hardhat compile` in the backend.
  - Restart the frontend server (`npm run dev`) to clear cache.

#### 3. "Nonce too high"
- **Cause**: MetaMask transaction history is out of sync with the local blockchain.
- **Fix**: Reset MetaMask account (Settings > Advanced > Clear Activity Tab Data).

## ⭐ Show Your Support

If you find this project helpful, please consider:

- ⭐ Starring the repository
- 🍴 Forking the project
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📢 Sharing with others

---

<div align="center">

**Made with ❤️ using Solidity, Next.js, and Web3**

[⬆ Back to Top](#-supply-chain-blockchain-dapp)

</div>
