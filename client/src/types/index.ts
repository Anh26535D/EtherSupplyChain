import React from 'react'

export interface Role {
    addr: string
    id: string
    name: string
    place: string
}

export interface Medicine {
    id: string
    name: string
    description: string
    rmsId: string
    manId: string
    disId: string
    retId: string
    stage: SupplyChainStage | string // Web3 call returns string, we cast to Enum
    timestamp?: string
    price: string
    seller: string
    buyer: string
    isDisputed: boolean
}

export type RoleType = 'rms' | 'man' | 'dis' | 'ret'

export interface RoleConfig {
    label: string
    plural: string
    icon: React.ReactNode
    color: string
    gradient: string
    bgGradient: string
    borderColor: string
}

export enum SupplyChainStage {
    Init = 0,
    RawMaterialSupply = 1,
    Manufacture = 2,
    Distribution = 3,
    Retail = 4,
    Sold = 5
}

export enum SupplyChainRole {
    RawMaterialSupplier = 0,
    Manufacturer = 1,
    Distributor = 2,
    Retailer = 3
}
