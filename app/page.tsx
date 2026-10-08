'use client'

import dynamic from 'next/dynamic'

const DatabaseCityRpg = dynamic(() => import('./database-city-rpg'), { ssr: false })

export default function Page() {
  return <DatabaseCityRpg />
}
