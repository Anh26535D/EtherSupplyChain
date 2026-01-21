# Supply Chain Project Architecture & Workflow

This document outlines the technical architecture, data flow, and operational workflow of the Blockchain-based Supply Chain application.

## 1. System Architecture

The project follows a **Hybrid Decentralized Architecture**, combining the trust and immutability of the blockchain with the efficiency of off-chain storage for metadata.

### 1.1 Tech Stack

*   **Frontend**:
    *   **Framework**: [Next.js](https://nextjs.org/) (React)
    *   **Language**: TypeScript
    *   **Blockchain Interaction**: [Web3.js](https://web3js.readthedocs.io/)
    *   **Styling**: Vanilla CSS / Tailwind CSS (Optional)
    *   **Architectural Pattern**: Service Layer Pattern (`contractService.ts` abstracts Web3 calls).

*   **Smart Contract (Blockchain)**:
    *   **Language**: Solidity (`^0.8.19`)
    *   **Framework**: [Hardhat](https://hardhat.org/)
    *   **Network**: Local Hardhat Network (Development) / Any EVM-compatible chain (Production)

*   **Data Storage (Hybrid Model)**:
    *   **On-Chain (Smart Contract)**:
        *   Core State (Stage enum: `Init`, `RawMaterialSupply`, etc.)
        *   Ownership Tracking (Addresses of RMS, Manufacturer, etc.)
        *   Timestamps
        *   Role Registries (Mappings of `address` -> `ID`)
    *   **Off-Chain (Metadata API)**:
        *   **Storage**: Local JSON file (`client/db.json`). In a production environment, this would be a database (PostgreSQL/MongoDB) or IPFS.
        *   **Purpose**: Stores expensive text data like Product Names, Descriptions, Location names, and Role details.
        *   **Interface**: Next.js API Routes (`/api/medicines`, `/api/roles`).

## 2. Data Flow

1.  **Read Path**:
    *   The Frontend fetches the **List of ID**s and their **Status** from the Smart Contract.
    *   Simultaneously, it fetches **Metadata** (names, places) from the Next.js API.
    *   The compiled data is displayed in the UI (e.g., in `track/page.tsx` or `supply/page.tsx`).

2.  **Write Path (Transactions)**:
    *   **Step 1 (Off-Chain)**: Metadata (e.g., new product name) is POSTed to the Next.js API and saved to `db.json`.
    *   **Step 2 (On-Chain)**: The user signs a transaction via MetaMask. This transaction interacts with the Smart Contract to change the state (e.g., `addMedicine`, `manufacture`).
    *   **Synchronization**: The Medicine ID used on-chain matches the ID stored in the off-chain database.

## 3. Operational Workflow

The supply chain lifecycle consists of 5 linear stages.

### Step 1: Registration (Owner Only)
*   **Actor**: Contract Owner
*   **Action**: Registers participants (Wallet Addresses) into specific roles:
    *   Raw Material Suppliers (RMS)
    *   Manufacturers (MAN)
    *   Distributors (DIS)
    *   Retailers (RET)
*   **Page**: `/roles`

### Step 2: Order / Initialization
*   **Actor**: Contract Owner
*   **Action**: Creates a new Medicine batch.
*   **State**: `Init` -> `Medicine Ordered`
*   **Data**: Generates a new unique Medicine ID.
*   **Page**: `/addmed`

### Step 3: Raw Material Supply
*   **Actor**: Raw Material Supplier (RMS)
*   **Action**: Supplies raw materials for a specific Medicine ID.
*   **State**: `RawMaterialSupply`
*   **Validation**: User must be registered as RMS.
*   **Page**: `/supply`

### Step 4: Manufacturing
*   **Actor**: Manufacturer (MAN)
*   **Action**: Processes raw materials into the final product.
*   **State**: `Manufacture`
*   **Validation**: User must be registered as Manufacturer. Previous stage must be `RawMaterialSupply`.
*   **Page**: `/supply`

### Step 5: Distribution
*   **Actor**: Distributor (DIS)
*   **Action**: Ships the product to retailers.
*   **State**: `Distribution`
*   **Validation**: User must be registered as Distributor. Previous stage must be `Manufacture`.
*   **Page**: `/supply`

### Step 6: Retail & Sale
*   **Actor**: Retailer (RET)
*   **Action 1**: Receives the shipment.
    *   **State**: `Retail`
*   **Action 2**: Sells the product to a consumer.
    *   **State**: `Sold`
*   **Page**: `/supply`

## 4. Key Contracts & Functions

*   `SupplyChain.sol`: Main entry point.
    *   `addMedicine()`: Starts the chain.
    *   `supplyRawMaterial(id)`: Transitions to RMS stage.
    *   `manufacture(id)`: Transitions to Manufacture stage.
    *   `distribute(id)`: Transitions to Distribution stage.
    *   `retail(id)`: Transitions to Retail stage.
    *   `sell(id)`: Finalizes the chain.
    *   `fetchMedicineBuffer(id)` / Public Getters: Retrieved state.
