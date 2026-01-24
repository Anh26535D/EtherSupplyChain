import { Web3 } from 'web3'

export const TransactionDebugger = {
    enabled: true,

    toggle: (enable: boolean) => {
        TransactionDebugger.enabled = enable
        console.log(`Debug Mode: ${enable ? 'ON' : 'OFF'}`)
    },

    logPre: async (web3: Web3, from: string, to: string | null = null, value: string = '0') => {
        if (!TransactionDebugger.enabled) return null
        try {
            const balanceFrom = await web3.eth.getBalance(from)
            let balanceTo = '0'
            // If 'to' is provided (e.g., seller), fetch their balance too
            if (to && web3.utils.isAddress(to)) {
                balanceTo = String(await web3.eth.getBalance(to))
            }

            console.group('🛠️ TRANSACTION DEBUG (PRE-EXECUTION)')
            console.log('From:', from)
            console.log('Balance (From):', web3.utils.fromWei(balanceFrom, 'ether'), 'ETH')
            if (to) {
                console.log('To (Receiver/Target):', to)
                console.log('Balance (To):', web3.utils.fromWei(balanceTo, 'ether'), 'ETH')
            }
            console.log('Value Sent:', web3.utils.fromWei(value, 'ether'), 'ETH')
            console.groupEnd()

            return { balanceFrom, balanceTo }
        } catch (e) {
            console.error('Debug Pre-Log Error:', e)
            return null
        }
    },

    logPost: async (web3: Web3, receipt: any, from: string, to: string | null = null, preData: any) => {
        if (!TransactionDebugger.enabled || !preData) return
        try {
            const balanceFromNew = await web3.eth.getBalance(from)
            let balanceToNew = '0'
            if (to && web3.utils.isAddress(to)) {
                balanceToNew = String(await web3.eth.getBalance(to))
            }

            // Calculate Gas Fee
            const gasUsed = BigInt(receipt.gasUsed)
            const effectiveGasPrice = BigInt(receipt.effectiveGasPrice || 0) // EIP-1559 or Legacy
            const feeWei = gasUsed * effectiveGasPrice
            const feeEth = web3.utils.fromWei(String(feeWei), 'ether')

            // Calculate Balance Changes
            const diffFrom = BigInt(balanceFromNew) - BigInt(preData.balanceFrom)
            const diffTo = BigInt(balanceToNew) - BigInt(preData.balanceTo)

            console.group('✅ TRANSACTION DEBUG (POST-EXECUTION)')
            console.log('Gas Used:', gasUsed.toString())
            console.log('Gas Price:', web3.utils.fromWei(String(effectiveGasPrice), 'gwei'), 'Gwei')
            console.log('💰 Transaction Fee:', feeEth, 'ETH')

            console.log('--- Balance Changes ---')
            console.log('Sender Delta:', web3.utils.fromWei(String(diffFrom), 'ether'), 'ETH')
            if (to) {
                console.log('Receiver Delta:', web3.utils.fromWei(String(diffTo), 'ether'), 'ETH')
            }
            console.groupEnd()
        } catch (e) {
            console.error('Debug Post-Log Error:', e)
        }
    }
}
