import TiaLogo from '../public/tia.svg'
import StargazeLogo from '../public/stargaze-logo.svg'
import { useEffect, useState } from 'react'
import { useChain } from '@cosmos-kit/react'

export const TIA_MINIMAL_DENOM =
  'ibc/14D1406D84227FDF4B055EA5CB2298095BBCA3F3BC3EF583AE6DF36F0FB179C8'

export const STARS_MINIMAL_DENOM = 'ustars'

export type DenomInfo = {
  name: string
  coinDenom: string
  coinMinimalDenom: string
  coinDecimals: number
  logo: string
}

export const STARGAZE_CHAIN_ID = 'stargaze-1'
export const TIA_CHAIN_ID = 'celestia'

export const denoms: Record<string, DenomInfo> = {
  [TIA_MINIMAL_DENOM]: {
    name: 'TIA',
    coinDenom: 'TIA',
    coinMinimalDenom: TIA_MINIMAL_DENOM,
    coinDecimals: 6,
    logo: TiaLogo,
  },
  [STARS_MINIMAL_DENOM]: {
    name: 'STARS',
    coinDenom: 'STARS',
    coinMinimalDenom: STARS_MINIMAL_DENOM,
    coinDecimals: 6,
    logo: StargazeLogo,
  },
}

const fetchBalance = async (address: string, chain: any) => {
  const res = await fetch(
    `${chain.apis?.rest?.[0].address}/cosmos/bank/v1beta1/balances/${address}`,
  )
  const response = await res.json()
  const starsBalance = response.balances.find((balance: any) => balance.denom === 'ustars')
  const tiaBalance = response.balances.find(
    (balance: any) =>
      balance.denom === 'ibc/14D1406D84227FDF4B055EA5CB2298095BBCA3F3BC3EF583AE6DF36F0FB179C8', // TIA
  )
  return {
    [STARS_MINIMAL_DENOM]: {
      amount: starsBalance?.amount ?? '0',
      denom: denoms[STARS_MINIMAL_DENOM],
    },
    [TIA_MINIMAL_DENOM]: {
      amount: tiaBalance?.amount ?? '0',
      denom: denoms[TIA_MINIMAL_DENOM],
    },
  }
}

export default function useBalances() {
  const { address, chain } = useChain('stargaze')
  const [balances, setBalances] = useState<Record<
    string,
    { amount: string; denom: DenomInfo }
  > | null>(null)

  useEffect(() => {
    if (address) {
      fetchBalance(address, chain).then(setBalances)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  return balances
}
