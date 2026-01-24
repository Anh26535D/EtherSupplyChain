import { Medicine, Role, RoleType } from '@/types'

export const ApiService = {
    medicines: {
        getAll: async (): Promise<Record<number, { name: string; description: string }>> => {
            const res = await fetch('/api/medicines')
            return res.json()
        },
        create: async (id: number, name: string, description: string) => {
            return fetch('/api/medicines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, description }),
            })
        },
    },
    roles: {
        getAll: async (): Promise<Record<string, Record<string, { name: string; place: string }>>> => {
            const res = await fetch('/api/roles')
            return res.json()
        },
        create: async (address: string, name: string, place: string, role: RoleType) => {
            return fetch('/api/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, name, place, role }),
            })
        },
    },
}
