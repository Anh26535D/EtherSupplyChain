# Supply Chain Blockchain - Backend

The smart contract and deployment infrastructure for the Supply Chain Management System.

## Project Structure

```
backend/
├── contracts/          # Solidity smart contracts
├── scripts/            # Hardhat deployment scripts
├── test/               # Test files
└── hardhat.config.ts   # Hardhat configuration
```

## Prerequisites

- Node.js 18+
- npm

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Compile contracts:
```bash
npm run compile
```

## Deployment

The deployment script (`scripts/deploy.ts`) automatically deploys the `SupplyChain` contract and updates the frontend configuration at `../client/src/deployments.json`.

### Option 1: Ephemeral Local Network (Hardhat Network)

This spins up a temporary network, deploys, and destroys it after completion. Useful for quick checks.

```bash
npm run deploy
```

### Option 2: Persistent Local Node (Recommended for Development)

1. Start the Hardhat node in a dedicated terminal:
```bash
npm run node
```
This will start a local blockchain on `http://127.0.0.1:8545` (Chain ID 1337) with pre-funded accounts.

2. Open a new terminal and deploy:
```bash
npm run deploy:local
```

**Note:** The deployment script will detect the network and automatically write the address to `../client/src/deployments.json`. You do **not** need to manually update the frontend configuration.

## Testing

Run the test suite:
```bash
npm test
```

## Features (Smart Contract)

- **Role Management**: Add Raw Material Suppliers, Manufacturers, Distributors, and Retailers.
- **Medicine Flow**:
  - `addOrder`: Manufacturers order raw materials.
  - `approveOrder`: Suppliers approve orders.
  - `startProduction`, `finishProduction`: Manufacturing lifecycle.
  - `startShipping`, `receiveShipping`: Logistics tracking between stages.

## Technology Stack

- **Hardhat**: Development environment
- **Solidity**: Smart contract language
- **TypeScript**: Deployment scripts and tests
- **Ethers.js**: Blockchain interaction

## License

MIT
