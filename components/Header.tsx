import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useState } from 'react'
import { FaBars, FaXTwitter } from 'react-icons/fa6'
import { MdOutlineClose } from 'react-icons/md'
import { WalletButton } from '../components/WalletButton'
import useBalances from '../hooks/useBalances'
import CelestineSlothsSociety from '../public/celestine-sloths-society.png'
import StargazeLogo from '../public/stargaze-logo.svg'
import Text from './Text'

export const ElementsContainerDynamic = dynamic(
  () => import('../components/ElementsContainer').then((mod) => mod.ElementsContainer),
  { ssr: false },
)

export function Header({
  openEmbeddedWalletModal,
  setIsElementsModalOpen,
}: {
  openEmbeddedWalletModal: Function
  setIsElementsModalOpen: Dispatch<SetStateAction<boolean>>
}) {
  const router = useRouter()

  const balances = useBalances()

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <section className='flex flex-wrap gap-x-3 gap-y-3 fixed backdrop-blur-md bg-[#212121DE] items-center justify-between px-10 py-4 top-0 left-0 right-0 z-10'>
      <Image
        src={CelestineSlothsSociety}
        alt='celestine-sloths'
        className='flex w-[70%] sm:w-[20%] cursor-pointer'
        onClick={() => {
          router.push('/')
        }}
      />

      <button className='sm:hidden' onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {!isMenuOpen ? (
          <FaBars color='#FFF' size={16} />
        ) : (
          <MdOutlineClose color='#FFF' size={16} />
        )}
      </button>

      <div id='nav-menu' className={`md:block ${isMenuOpen ? '' : 'hidden'}`}>
        <div className='flex flex-row gap-3 flex-wrap'>
          <button
            onClick={() => {
              router.push('/snapshot')
            }}
            className='flex gap-2 items-center h-10 justify-between border border-white-100 rounded-3xl px-5 py-2'
          >
            <Text size='sm' color='text-white-100 font-bold'>
              Snapshot
            </Text>
          </button>

          <button
            onClick={() => window.open('https://twitter.com/CelestineSloths', '_blank')}
            className='flex flex-row gap-2 h-10 items-center justify-between border border-white-100 rounded-3xl px-5 py-2'
          >
            <FaXTwitter color='#FFF' size={16} />
            <Text size='sm' color='text-white-100 font-bold'>
              Follow
            </Text>
          </button>

          <button
            onClick={() => {
              setIsElementsModalOpen(true)
            }}
            className='flex gap-2 items-center h-10 justify-between border border-white-100 rounded-3xl px-5 py-2'
          >
            <div className='flex justify-between items-center'>
              <Image src={StargazeLogo} height={16} width={16} alt='Get Tokens' />
            </div>
            <Text size='sm' color='text-white-100 font-bold'>
              Get Tokens
            </Text>
          </button>

          <WalletButton
            balances={balances || null}
            openEmbeddedWalletModal={openEmbeddedWalletModal}
          />
        </div>
      </div>
    </section>
  )
}
