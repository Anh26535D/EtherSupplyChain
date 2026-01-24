import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("SupplyChain Gas Reporting", function () {
    async function deploySupplyChainFixture() {
        const [owner, rms, man, dis, ret, consumer] = await ethers.getSigners();
        const SupplyChain = await ethers.getContractFactory("SupplyChain");
        const supplyChain = await SupplyChain.deploy();

        // Add Roles
        await supplyChain.connect(owner).addRawMaterialSupplier(rms.address);
        await supplyChain.connect(owner).addManufacturer(man.address);
        await supplyChain.connect(owner).addDistributor(dis.address);
        await supplyChain.connect(owner).addRetailer(ret.address);

        return { supplyChain, owner, rms, man, dis, ret, consumer };
    }

    it("Should report gas for full lifecycle", async function () {
        const { supplyChain, owner, rms, man } = await loadFixture(deploySupplyChainFixture);

        // 1. Add Medicine
        await supplyChain.connect(owner).addMedicine();

        // 2. Supply Raw Material
        const price = ethers.parseEther("1.0");
        await supplyChain.connect(rms).supplyRawMaterial(1, price);

        // 3. Purchase (Manufacture)
        await supplyChain.connect(man).purchaseItem(1, { value: price });

        // 4. Confirm Received
        await supplyChain.connect(man).confirmReceived(1);

        expect(true).to.be.true; // Just ensuring it runs for gas report
    });
});
