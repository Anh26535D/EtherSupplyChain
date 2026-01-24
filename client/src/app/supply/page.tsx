'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'
import { getMedicineStageLabel, STAGE } from '@/lib/constants'
import { contractService } from '@/lib/contractService'
import { ApiService } from '@/services/api'
import { Medicine } from '@/types'
import Web3 from 'web3' // Use Web3 for utilities

export default function Supply() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loader, setLoader] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  const [med, setMed] = useState<{ [key: number]: Medicine }>({})
  const [medStage, setMedStage] = useState<string[]>([])

  // Inputs
  const [rmsId, setRmsId] = useState('')
  const [rmsPrice, setRmsPrice] = useState('') // New



  // Common Management Inputs
  const [manageId, setManageId] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [disputeReason, setDisputeReason] = useState('')
  const [debugMode, setDebugMode] = useState(true)

  useEffect(() => {
    loadWeb3()
    loadBlockchainData()
  }, [])

  useEffect(() => {
    contractService.setDebugMode(debugMode)
  }, [debugMode])

  const loadBlockchainData = async () => {
    try {
      setLoader(true)
      const { contract, account } = await getContract()
      setSupplyChain(contract)
      setCurrentAccount(account)

      const medCtr = await contractService.getMedicineCount(contract)
      const medData: { [key: number]: Medicine } = {}
      const medStageData: string[] = []

      // Fetch off-chain data
      const offChainData = await ApiService.medicines.getAll()

      for (let i = 0; i < medCtr; i++) {
        const chainMed = await contractService.getMedicine(contract, i + 1)
        const meta = offChainData[Number(chainMed.id)] || { name: 'Unknown', description: 'No data' }

        // chainMed now includes price, seller, buyer, isDisputed
        medData[i] = { ...chainMed, ...meta }
        medStageData[i] = getMedicineStageLabel(chainMed.stage)
      }

      setMed(medData)
      setMedStage(medStageData)
      setLoader(false)
    } catch (err: any) {
      const errorMessage = err?.message || 'The smart contract is not deployed to the current network'
      console.error('Error loading blockchain data:', err)
      alert(errorMessage)
      setLoader(false)
    }
  }

  const handlerChangeRMSId = (event: React.ChangeEvent<HTMLInputElement>) => setRmsId(event.target.value)
  const handlerChangeRMSPrice = (event: React.ChangeEvent<HTMLInputElement>) => setRmsPrice(event.target.value)



  const handlerChangeManageId = (event: React.ChangeEvent<HTMLInputElement>) => setManageId(event.target.value)
  const handlerChangeNewPrice = (event: React.ChangeEvent<HTMLInputElement>) => setNewPrice(event.target.value)
  const handlerChangeDisputeReason = (event: React.ChangeEvent<HTMLInputElement>) => setDisputeReason(event.target.value)

  const handlerSubmitRaiseDispute = async (event: React.FormEvent, id: string | null = null) => {
    event.preventDefault()
    const targetId = id || manageId
    try {
      const receipt = await contractService.raiseDispute(supplyChain, currentAccount, targetId, disputeReason)
      if (receipt) {
        loadBlockchainData()
        setManageId('')
        setDisputeReason('')
        alert('Dispute raised successfully! Funds are now locked.')
      }
    } catch (err: any) {
      const msg = err.message || err.toString()
      alert('Error raising dispute: ' + msg)
    }
  }

  const handlerSubmitResolveDispute = async (refundBuyer: boolean) => {
    try {
      const isOwner = await contractService.checkIsOwner(supplyChain, currentAccount)
      if (!isOwner) {
        alert('Only the contract owner can resolve disputes.')
        return
      }

      const receipt = await contractService.resolveDispute(supplyChain, currentAccount, manageId, refundBuyer)
      if (receipt) {
        loadBlockchainData()
        setManageId('')
        alert(`Dispute resolved! Funds ${refundBuyer ? 'returned to Buyer' : 'released to Seller'}.`)
      }
    } catch (err: any) {
      const msg = err.message || err.toString()
      alert('Error resolving dispute: ' + msg)
    }
  }

  const handlerSubmitRMSsupply = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      // 1. Check Role
      const checkId = await contractService.findRawMaterialSupplier(supplyChain, currentAccount)
      if (checkId === 0) {
        alert('You are not a registered Raw Material Supplier. Please register in the Roles page first.')
        return
      }

      // 2. Check Order Existence (Protection against Gas Limit Error)
      const count = await contractService.getMedicineCount(supplyChain)
      if (Number(rmsId) > count || Number(rmsId) <= 0) {
        alert(`Medicine ID ${rmsId} does not exist. Please create an Order in "Order Materials" page first.`)
        return
      }

      // 3. Check Stage (Optional but good UX)
      try {
        const med = await contractService.getMedicine(supplyChain, Number(rmsId))
        if (Number(med.stage) !== 0) { // Stage.Init = 0
          alert(`Medicine ID ${rmsId} is not in 'Ordered' stage. Current stage: ${med.stage}`)
          return
        }
      } catch (e) {
        // Ignore if fetch fails, let contract handle it
      }

      const priceWei = Web3.utils.toWei(rmsPrice, 'ether')
      const receipt = await contractService.supplyRawMaterial(supplyChain, currentAccount, rmsId, priceWei)
      if (receipt) {
        loadBlockchainData()
        setRmsId('')
        setRmsPrice('')
        alert('Raw materials supplied successfully!')
      }
    } catch (err: any) {
      handleError(err)
    }
  }

  const handlerSubmitPurchase = async (event: React.FormEvent, id: string, roleCheckFn: any, roleName: string) => {
    event.preventDefault()
    try {
      if (roleCheckFn) {
        const checkId = await roleCheckFn(supplyChain, currentAccount)
        if (checkId === 0) {
          alert(`You are not a registered ${roleName}.`)
          return
        }
      }

      // Fetch fresh data to get accurate price
      const chainMed = await contractService.getMedicine(supplyChain, Number(id))
      const priceVal = chainMed.price

      const receipt = await contractService.purchaseItem(supplyChain, currentAccount, id, priceVal)
      if (receipt) {
        loadBlockchainData()
        alert(`Purchase successful!`)

      }
    } catch (err: any) {
      handleError(err)
    }
  }

  const handlerSubmitConfirm = async (event: React.FormEvent, id: string | null = null) => {
    event.preventDefault()
    const targetId = id || manageId
    try {
      const med = await contractService.getMedicine(supplyChain, Number(targetId))

      if (med.buyer.toLowerCase() !== currentAccount.toLowerCase()) {
        alert('You are not the Buyer of this item. Only the Buyer can confirm receipt.')
        return
      }
      if (med.isDisputed) {
        alert('This item is currently disputed. Resolve the dispute first.')
        return
      }

      const receipt = await contractService.confirmReceived(supplyChain, currentAccount, targetId)
      if (receipt) {
        loadBlockchainData()
        alert('Receipt Confirmed! Funds released to seller.')
      }
    } catch (err: any) {
      handleError(err)
    }
  }

  const handlerSubmitSetPrice = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const med = await contractService.getMedicine(supplyChain, Number(manageId))
      const stage = Number(med.stage)

      // Validation: Check if user is the correct role for this stage
      let isAuthorized = false
      let roleName = ''

      if (stage === 1) { // RMS supplied, moving to Man
        const myId = await contractService.findRawMaterialSupplier(supplyChain, currentAccount)
        if (Number(med.rmsId) === Number(myId)) isAuthorized = true
        roleName = 'Raw Material Supplier'
      } else if (stage === 2) {
        const myId = await contractService.findManufacturer(supplyChain, currentAccount)
        if (Number(med.manId) === Number(myId)) isAuthorized = true
        roleName = 'Manufacturer'
      } else if (stage === 3) {
        const myId = await contractService.findDistributor(supplyChain, currentAccount)
        if (Number(med.disId) === Number(myId)) isAuthorized = true
        roleName = 'Distributor'
      } else if (stage === 4) {
        const myId = await contractService.findRetailer(supplyChain, currentAccount)
        if (Number(med.retId) === Number(myId)) isAuthorized = true
        roleName = 'Retailer'
      }

      if (!isAuthorized) {
        alert(`You are not the registered ${roleName || 'owner'} for this item (ID: ${manageId}).`)
        return
      }

      const priceWei = Web3.utils.toWei(newPrice, 'ether')
      const receipt = await contractService.setPrice(supplyChain, currentAccount, manageId, priceWei)
      if (receipt) {
        loadBlockchainData()
        setNewPrice('')
        alert('New Price Set!')
      }
    } catch (err: any) {
      handleError(err)
    }
  }

  const handleError = (err: any) => {
    let errorMessage = 'An error occurred!'
    if (err?.message) {
      errorMessage = err.message
    } else if (err?.error?.message) {
      errorMessage = err.error.message
    }

    if (errorMessage.includes('revert')) {
      const revertMsg = errorMessage.match(/revert (.*)/)
      if (revertMsg && revertMsg[1]) errorMessage = revertMsg[1]
    }

    console.error('Transaction error:', err)
    alert(errorMessage)
  }




  const getStageColor = (stage: string) => {
    if (stage === STAGE.Ordered) return 'bg-blue-100 text-blue-700 border-blue-300'
    if (stage === STAGE.RawMaterialSupply) return 'bg-green-100 text-green-700 border-green-300'
    if (stage === STAGE.Manufacturing) return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    if (stage === STAGE.Distribution) return 'bg-purple-100 text-purple-700 border-purple-300'
    if (stage === STAGE.Retail) return 'bg-orange-100 text-orange-700 border-orange-300'
    if (stage === STAGE.Sold) return 'bg-gray-100 text-gray-700 border-gray-300'
    return 'bg-gray-100 text-gray-700 border-gray-300'
  }

  if (loader) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-700">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Supply Chain Flow</h1>
                <p className="text-gray-600 text-sm">Manage the flow of materials through the supply chain</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              HOME
            </button>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-xs text-gray-500 font-mono">
              Account: {currentAccount}
            </div>
            <label className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer hover:text-blue-600 transition-colors">
              <input
                type="checkbox"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="font-semibold">🐞 Debug Mode (View Console)</span>
            </label>
          </div>
        </div>

        {/* Flow Visualization */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Supply Chain Process Flow
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                1
              </div>
              <span className="text-xs mt-2 text-gray-700 font-semibold text-center">Order</span>
            </div>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-xs mt-2 text-gray-700 font-semibold text-center">RMS</span>
            </div>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-xs mt-2 text-gray-700 font-semibold text-center">Manufacture</span>
            </div>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <span className="text-xs mt-2 text-gray-700 font-semibold text-center">Distribute</span>
            </div>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-xs mt-2 text-gray-700 font-semibold text-center">Retail</span>
            </div>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs mt-2 text-gray-700 font-semibold text-center">Sold</span>
            </div>
          </div>
        </div>

        {/* Unified Dashboard */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">

          {/* Quick Supply (RMS Only) */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 border-t-8 border-blue-500">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🏭 Supply New Material</h3>
            <p className="text-sm text-gray-500 mb-4">Register a new raw material batch and set the initial price.</p>
            <form onSubmit={handlerSubmitRMSsupply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Battery ID</label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  type="text"
                  onChange={handlerChangeRMSId}
                  placeholder="e.g. 1"
                  value={rmsId}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price (ETH)</label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  type="text"
                  onChange={handlerChangeRMSPrice}
                  placeholder="e.g. 0.5"
                  value={rmsPrice}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Supply & List
              </button>
            </form>
          </div>

          {/* Action Center - Replaces old forms */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border-t-8 border-orange-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">🛍️ Marketplace & Actions</h3>
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">Auto-detected Roles</span>
            </div>

            {/* Smart Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Seller</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Stage</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.keys(med).map((key) => {
                    const index = parseInt(key)
                    const item = med[index]
                    const stage = medStage[index]
                    const priceEth = item.price ? Web3.utils.fromWei(item.price, 'ether') : '0'
                    const sellerAddr = (item.seller && item.seller !== '0x0000000000000000000000000000000000000000')
                      ? `${item.seller.substring(0, 6)}...${item.seller.substring(38)}`
                      : '-'
                    const isMyItem = (item.buyer && item.buyer.toLowerCase() === currentAccount.toLowerCase()) ||
                      (item.seller && item.seller.toLowerCase() === currentAccount.toLowerCase())

                    // Logic to determine Action Button
                    let ActionButton = null;
                    const isSold = item.buyer && item.buyer !== '0x0000000000000000000000000000000000000000';
                    const isPriceSet = item.price && BigInt(item.price) > BigInt(0);

                    // 1. Pending Confirmation State (Sold but money held in contract)
                    if (isSold) {
                      if (item.buyer.toLowerCase() === currentAccount.toLowerCase()) {
                        // I am the Buyer -> Show Confirm
                        ActionButton = (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={(e) => { setManageId(item.id.toString()); handlerSubmitConfirm(e, item.id.toString()) }}
                              className="px-3 py-1 text-xs text-white bg-blue-600 rounded shadow hover:bg-blue-700 animate-pulse"
                            >
                              Confirm Receipt
                            </button>
                            <button
                              onClick={(e) => { setManageId(item.id.toString()); setDisputeReason("Defective Goods"); handlerSubmitRaiseDispute(e, item.id.toString()) }}
                              className="px-3 py-1 text-[10px] text-red-600 border border-red-200 rounded hover:bg-red-50"
                            >
                              Raise Dispute
                            </button>
                          </div>
                        )
                      } else {
                        // Someone else bought it -> Pending
                        ActionButton = <span className="text-xs text-orange-500 font-bold">Sold - Pending Confirmation</span>
                      }
                    }
                    // 2. For Sale State (Listed)
                    else if (isPriceSet && !item.isDisputed) {
                      let buyHandler = null;
                      let btnColor = "bg-gray-800 hover:bg-black";
                      let btnText = "Buy";

                      if (stage === STAGE.RawMaterialSupply) {
                        buyHandler = (e: any) => handlerSubmitPurchase(e, item.id.toString(), contractService.findManufacturer, 'Manufacturer');
                        btnColor = "bg-green-600 hover:bg-green-700";
                        btnText = "Buy (Man)";
                      } else if (stage === STAGE.Manufacturing) {
                        buyHandler = (e: any) => handlerSubmitPurchase(e, item.id.toString(), contractService.findDistributor, 'Distributor');
                        btnColor = "bg-purple-600 hover:bg-purple-700";
                        btnText = "Buy (Dis)";
                      } else if (stage === STAGE.Distribution) {
                        buyHandler = (e: any) => handlerSubmitPurchase(e, item.id.toString(), contractService.findRetailer, 'Retailer');
                        btnColor = "bg-orange-600 hover:bg-orange-700";
                        btnText = "Buy (Ret)";
                      } else if (stage === STAGE.Retail) {
                        buyHandler = (e: any) => handlerSubmitPurchase(e, item.id.toString(), null, 'Consumer');
                        btnColor = "bg-red-600 hover:bg-red-700";
                        btnText = "Buy (Cons)";
                      }

                      if (buyHandler) {
                        ActionButton = (
                          <button onClick={buyHandler} className={`px-3 py-1 text-xs text-white rounded shadow ${btnColor}`}>
                            {btnText}
                          </button>
                        )
                      }
                    }
                    // 3. Unlisted State (Needs Pricing or invalid)
                    else if (!isPriceSet && stage !== STAGE.Sold && stage !== STAGE.Ordered && !item.isDisputed) {
                      ActionButton = (
                        <button
                          onClick={() => { setManageId(item.id.toString()); window.scrollTo(0, document.body.scrollHeight); }}
                          className="px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                        >
                          List for Sale
                        </button>
                      )
                    } else if (item.isDisputed) {
                      ActionButton = <span className="text-xs text-red-600 font-bold bg-red-100 px-2 py-1 rounded">⛔ DISPUTED</span>
                    }

                    return (
                      <tr key={key} className={isMyItem ? "bg-blue-50" : ""}>
                        <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-600" title={item.seller}>{sellerAddr}</td>
                        <td className="px-4 py-3">
                          {item.isDisputed ? (
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold border bg-red-100 text-red-700 border-red-300 flex items-center w-fit gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              IN DISPUTE
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getStageColor(stage)}`}>
                              {stage}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">{priceEth} <span className="text-xs text-gray-500">ETH</span></td>
                        <td className="px-4 py-3">
                          {ActionButton || <span className="text-xs text-gray-400">-</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Management Section - Dynamic Inventory */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-t-8 border-gray-800 mt-8">
          <h5 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            My Inventory & Actions
          </h5>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(med).map((key) => {
              const item = med[parseInt(key)]
              const priceEth = Web3.utils.fromWei(item.price || '0', 'ether')
              const isBuyer = item.buyer && currentAccount && item.buyer.toLowerCase() === currentAccount.toLowerCase()
              // const isSeller = item.seller && currentAccount && item.seller.toLowerCase() === currentAccount.toLowerCase()
              // Check if I am the 'owner' of this stage to set price
              // We need my role ID. contractService has `findRole`. We can't easy check synchronous here.
              // Simplified: Show actions where I am involved as Buyer/Seller/Owner

              // We will rely on explicit forms as fallback, but this helps.
              // Actually, let's just make the forms generic but use a 'Select ID' dropdown populated by my items?
              // No, let's keep the forms but make them nicer, AND add a "Quick Actions" list.

              return null // We will implement the generic forms below instead of complex per-item logic for now to ensure stability
            })}

            {/* 1. Confirm Receipt Card */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h6 className="font-bold text-gray-700">Confirm Receipt</h6>
              </div>
              <p className="text-xs text-gray-500 mb-4 h-10">Received goods? Release funds to the seller to complete the purchase.</p>
              <form onSubmit={(e) => { setManageId(manageId); handlerSubmitConfirm(e); }}>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                  type="text"
                  onChange={(e) => setManageId(e.target.value)}
                  placeholder="Enter Battery ID"
                  required
                />
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                  Confirm & Release Funds
                </button>
              </form>
            </div>

            {/* 2. Set Price Card */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h6 className="font-bold text-gray-700">Set Selling Price</h6>
              </div>
              <p className="text-xs text-gray-500 mb-4 h-10">Ready to sell? List the item for the next buyer.</p>
              <form onSubmit={(e) => { setManageId(manageId); handlerSubmitSetPrice(e); }}>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                  type="text"
                  onChange={(e) => setManageId(e.target.value)}
                  placeholder="Enter Battery ID"
                  required
                />
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                  type="text"
                  onChange={handlerChangeNewPrice}
                  placeholder="Price (ETH)"
                  required
                />
                <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                  Set Price
                </button>
              </form>
            </div>

            {/* 3. Raise Dispute Card */}
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h6 className="font-bold text-red-700">Raise Dispute</h6>
              </div>
              <p className="text-xs text-red-500 mb-4 h-10">Issues with the product? Lock funds and request intervention.</p>
              <form onSubmit={(e) => { setManageId(manageId); handlerSubmitRaiseDispute(e); }}>
                <input
                  className="w-full px-3 py-2 border border-red-200 rounded-lg mb-2 text-sm focus:ring-red-500"
                  type="text"
                  onChange={(e) => setManageId(e.target.value)}
                  placeholder="Enter Battery ID"
                  required
                />
                <input
                  className="w-full px-3 py-2 border border-red-200 rounded-lg mb-2 text-sm focus:ring-red-500"
                  type="text"
                  onChange={handlerChangeDisputeReason}
                  placeholder="Reason"
                  required
                />
                <button type="submit" className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
                  Raise Dispute
                </button>
              </form>
            </div>

            {/* 4. Resolve Dispute Card */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-gray-200 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                </div>
                <h6 className="font-bold text-gray-700">Resolve (Admin)</h6>
              </div>
              <p className="text-xs text-gray-500 mb-4 h-10">Contract Owner: Adjudicate disputes and release funds.</p>
              <div className="space-y-2">
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                  type="text"
                  onChange={(e) => setManageId(e.target.value)}
                  placeholder="Enter Battery ID"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handlerSubmitResolveDispute(true)}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-xs"
                  >
                    Refund Buyer
                  </button>
                  <button
                    onClick={() => handlerSubmitResolveDispute(false)}
                    className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-xs"
                  >
                    Pay Seller
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
