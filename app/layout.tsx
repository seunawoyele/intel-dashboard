import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Intel Archive',
  description: 'Crypto & AI intelligence dashboard',
}

export const revalidate = 300

// 2026-08-21 fix: fetches live from the data-only repo instead of reading a
// bundled public/data/meta.json -- see lib/data.ts for why.
async function getMeta() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/seunawoyele/intel-dashboard-data/main/meta.json', { next: { revalidate: 300 } })
    if (!res.ok) throw new Error(String(res.status))
    return await res.json()
  } catch {
    return { updated: null, post_count: 0, ner_coverage: 0 }
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const meta = await getMeta()
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
