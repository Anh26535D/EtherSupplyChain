import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

const dbPath = path.join(process.cwd(), 'db.json')

function getDB() {
    if (!fs.existsSync(dbPath)) {
        return { medicines: {}, roles: {} }
    }
    const data = fs.readFileSync(dbPath, 'utf8')
    return JSON.parse(data)
}

function saveDB(data: any) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    const db = getDB()

    if (address) {
        return NextResponse.json(db.roles[address] || {})
    }
    return NextResponse.json(db.roles)
}

export async function POST(request: Request) {
    const body = await request.json()
    const { address, name, place, role } = body

    if (!address || !name || !place || !role) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const db = getDB()

    // Initialize address entry if missing or if it's the old format (check if it has 'roles' array)
    // If it has 'roles' array, we wipe it to start fresh with the new structure or we could try to keep it,
    // but mixing types is messy. For this prototype, if it's not a plain object of roles, we reset.
    // However, existing[role] check is safer.

    if (!db.roles[address] || db.roles[address].roles) {
        db.roles[address] = {}
    }

    // Store metadata specific to the role
    db.roles[address][role] = { name, place }

    saveDB(db)

    return NextResponse.json({ success: true, updated: db.roles[address] })
}
