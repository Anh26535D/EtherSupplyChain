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
    db.roles[address] = { address, name, place, role }
    saveDB(db)

    return NextResponse.json({ success: true })
}
