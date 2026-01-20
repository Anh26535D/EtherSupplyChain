import { RoleType } from '@/types'

export const contractService = {
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
        return await contract.methods.addMedicine().send({ from: account })
    },

    addRole: async (contract: any, account: string, type: string, address: string) => {
        switch (type) {
            case 'rms':
                return await contract.methods.addRawMaterialSupplier(address).send({ from: account })
            case 'man':
                return await contract.methods.addManufacturer(address).send({ from: account })
            case 'dis':
                return await contract.methods.addDistributor(address).send({ from: account })
            case 'ret':
                return await contract.methods.addRetailer(address).send({ from: account })
            default:
                throw new Error('Invalid role type')
        }
    },

    supplyRawMaterial: async (contract: any, account: string, medicineId: string) => {
        return await contract.methods.supplyRawMaterial(medicineId).send({ from: account })
    },

    manufacture: async (contract: any, account: string, medicineId: string) => {
        return await contract.methods.manufacture(medicineId).send({ from: account })
    },

    distribute: async (contract: any, account: string, medicineId: string) => {
        return await contract.methods.distribute(medicineId).send({ from: account })
    },

    retail: async (contract: any, account: string, medicineId: string) => {
        return await contract.methods.retail(medicineId).send({ from: account })
    },

    sell: async (contract: any, account: string, medicineId: string) => {
        return await contract.methods.sell(medicineId).send({ from: account })
    }
}
