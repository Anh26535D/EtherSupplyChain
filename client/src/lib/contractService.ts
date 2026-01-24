import { RoleType } from '@/types'
import { TransactionDebugger } from './debugger'
import { Web3 } from 'web3'

declare global {
    interface Window {
        web3?: any
    }
}

export const contractService = {
    // Debug Control
    setDebugMode: (enabled: boolean) => {
        TransactionDebugger.toggle(enabled)
    },

    getMedicineCount: async (contract: any) => {
        return Number(await contract.methods.medicineCount().call())
    },

    getMedicine: async (contract: any, id: number) => {
        return await contract.methods.medicines(id).call()
    },

    getOwner: async (contract: any) => {
        return await contract.methods.owner().call()
    },

    checkIsOwner: async (contract: any, account: string) => {
        const owner = await contractService.getOwner(contract)
        return owner && account && owner.toLowerCase() === account.toLowerCase()
    },

    // Role Counts
    getRoleCounts: async (contract: any) => {
        const rmsCount = await contract.methods.rmsCount().call()
        const manCount = await contract.methods.manufacturerCount().call()
        const disCount = await contract.methods.distributorCount().call()
        const retCount = await contract.methods.retailerCount().call()
        return {
            rms: Number(rmsCount),
            man: Number(manCount),
            dis: Number(disCount),
            ret: Number(retCount)
        }
    },

    // Role getters
    getRole: async (contract: any, type: RoleType, id: number) => {
        switch (type) {
            case 'rms': return await contract.methods.rawMaterialSuppliers(id).call()
            case 'man': return await contract.methods.manufacturers(id).call()
            case 'dis': return await contract.methods.distributors(id).call()
            case 'ret': return await contract.methods.retailers(id).call()
            default: return null
        }
    },

    checkRoleRegistered: async (contract: any, type: string, address: string) => {
        let checkId = '0'
        switch (type) {
            case 'rms':
                checkId = await contract.methods.findRawMaterialSupplier(address).call()
                break
            case 'man':
                checkId = await contract.methods.findManufacturer(address).call()
                break
            case 'dis':
                checkId = await contract.methods.findDistributor(address).call()
                break
            case 'ret':
                checkId = await contract.methods.findRetailer(address).call()
                break
        }
        return Number(checkId) > 0
    },

    // Check specific roles directly (for supply page etc)
    findRawMaterialSupplier: async (contract: any, address: string) => Number(await contract.methods.findRawMaterialSupplier(address).call()),
    findManufacturer: async (contract: any, address: string) => Number(await contract.methods.findManufacturer(address).call()),
    findDistributor: async (contract: any, address: string) => Number(await contract.methods.findDistributor(address).call()),
    findRetailer: async (contract: any, address: string) => Number(await contract.methods.findRetailer(address).call()),

    // Transactions
    addMedicine: async (contract: any, account: string) => {
        const web3 = window.web3 as Web3
        const debugData = await TransactionDebugger.logPre(web3, account)

        const receipt = await contract.methods.addMedicine().send({ from: account })

        await TransactionDebugger.logPost(web3, receipt, account, null, debugData)
        return receipt
    },

    addRole: async (contract: any, account: string, type: string, address: string) => {
        const web3 = window.web3 as Web3
        const debugData = await TransactionDebugger.logPre(web3, account)

        let receipt;
        switch (type) {
            case 'rms':
                receipt = await contract.methods.addRawMaterialSupplier(address).send({ from: account })
                break;
            case 'man':
                receipt = await contract.methods.addManufacturer(address).send({ from: account })
                break;
            case 'dis':
                receipt = await contract.methods.addDistributor(address).send({ from: account })
                break;
            case 'ret':
                receipt = await contract.methods.addRetailer(address).send({ from: account })
                break;
            default:
                throw new Error('Invalid role type')
        }

        await TransactionDebugger.logPost(web3, receipt, account, null, debugData)
        return receipt
    },

    supplyRawMaterial: async (contract: any, account: string, medicineId: string, price: string) => {
        const web3 = window.web3 as Web3
        const debugData = await TransactionDebugger.logPre(web3, account)

        const receipt = await contract.methods.supplyRawMaterial(medicineId, price).send({ from: account })

        await TransactionDebugger.logPost(web3, receipt, account, null, debugData)
        return receipt
    },

    purchaseItem: async (contract: any, account: string, medicineId: string, priceVal: string) => {
        const web3 = window.web3 as Web3
        // Receiver is Contract (Escrow)
        const debugData = await TransactionDebugger.logPre(web3, account, contract.options.address, priceVal)

        const receipt = await contract.methods.purchaseItem(medicineId).send({ from: account, value: priceVal })

        await TransactionDebugger.logPost(web3, receipt, account, contract.options.address, debugData)
        return receipt
    },

    confirmReceived: async (contract: any, account: string, medicineId: string) => {
        const web3 = window.web3 as Web3
        // To track seller, we'd need to fetch medicine data first.
        // For efficiency, we'll try to peek, but if not we just log sender.
        let seller = null;
        if (TransactionDebugger.enabled) {
            const med = await contract.methods.medicines(medicineId).call();
            seller = med.seller;
        }

        const debugData = await TransactionDebugger.logPre(web3, account, seller)

        const receipt = await contract.methods.confirmReceived(medicineId).send({ from: account })

        await TransactionDebugger.logPost(web3, receipt, account, seller, debugData)
        return receipt
    },

    setPrice: async (contract: any, account: string, medicineId: string, price: string) => {
        const web3 = window.web3 as Web3
        const debugData = await TransactionDebugger.logPre(web3, account)

        const receipt = await contract.methods.setPrice(medicineId, price).send({ from: account })

        await TransactionDebugger.logPost(web3, receipt, account, null, debugData)
        return receipt
    },

    raiseDispute: async (contract: any, account: string, medicineId: string, reason: string) => {
        return await contract.methods.raiseDispute(medicineId, reason).send({ from: account })
    },

    resolveDispute: async (contract: any, account: string, medicineId: string, refundBuyer: boolean) => {
        const web3 = window.web3 as Web3
        let target = null

        // Debugging: Identify who gets the money
        if (TransactionDebugger.enabled) {
            try {
                const med = await contract.methods.medicines(medicineId).call()
                target = refundBuyer ? med.buyer : med.seller
            } catch (e) {
                console.warn("Could not fetch medicine details for debug log")
            }
        }

        const debugData = await TransactionDebugger.logPre(web3, account, target)

        const receipt = await contract.methods.resolveDispute(medicineId, refundBuyer).send({ from: account })

        await TransactionDebugger.logPost(web3, receipt, account, target, debugData)
        return receipt
    }
}
