import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import fs from 'fs'
import path from 'path'

export const metadata: Metadata = {
  title: 'Intel Archive',
  description: 'Crypto & AI intelligence dashboard',
}

export const revalidate = 7200

function getMeta() {
  try {
    const p = path.join(process.cwd(), 'public', 'data', 'meta.json')
    return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch {
    return { updated: null, post_count: 0, ner_coverage: 0 }
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const meta = getMeta()
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-bg">
        <Sidebar meta={meta} />
        <main className="flex-1 overflow-y-auto bg-bg">
          {children}
        </main>
      </body>
    </html>
  )
}
