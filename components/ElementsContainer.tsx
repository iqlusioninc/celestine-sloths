import { SwapsModal, WalletClientContextProvider } from '@leapwallet/elements'

import { useChain } from '@cosmos-kit/react'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { useElementsWalletClient } from '../config/walletclient'
import { STARGAZE_CHAIN_ID, TIA_MINIMAL_DENOM } from '../hooks/useBalances'
import { TIA_CHAIN_ID } from '../hooks/useBalances'

export const renderLiquidityButton = ({ onClick }: any) => {
  return <button onClick={onClick} id='open-liquidity-modal-btn'></button>
}

interface Props {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

export function ElementsContainer({ isOpen, setIsOpen }: Props) {
  const { address, openView } = useChain('stargaze')
  const walletClient = useElementsWalletClient()
  useEffect(() => {
    const elementsModal = document.querySelector('.leap-ui')
    if (elementsModal) {
      //@ts-ignore
      elementsModal.style['zIndex'] = 11
    }
  }, [])
  return (
    <div className='fixed z-99 leap-ui dark'>
      <WalletClientContextProvider
        value={{
          userAddress: address,
          walletClient: walletClient,
          connectWallet: async () => {
            openView()
          },
        }}
      >
        <SwapsModal
          key={STARGAZE_CHAIN_ID + TIA_MINIMAL_DENOM}
          isOpen={isOpen}
          title='Get Tokens'
          setIsOpen={setIsOpen}
          className='max-w-[95vw]'
          defaultValues={{
            destinationChainId: STARGAZE_CHAIN_ID,
            destinationAsset: TIA_MINIMAL_DENOM,
          }}
        />
      </WalletClientContextProvider>
    </div>
  )
}
