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

export async function GET() {
    const db = getDB()
    return NextResponse.json(db.medicines)
}

export async function POST(request: Request) {
    const body = await request.json()
    const { id, name, description } = body

    if (!id || !name || !description) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const db = getDB()
    db.medicines[id] = { id, name, description }
    saveDB(db)

    return NextResponse.json({ success: true })
}
