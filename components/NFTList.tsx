import { useQuery } from '@apollo/client'

import { GenericNFTCard } from './GenericNFTCard'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toUtf8 } from '@cosmjs/encoding'
import { useChain } from '@cosmos-kit/react'
import { cosmwasm, getSigningCosmwasmClient } from 'stargazejs'
import BN from 'bignumber.js'

import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import toast from 'react-hot-toast'
import { ListControl } from './ListControl'
import GenericNFTCardSkeleton from './GenericNFTCardSkeleton'
import { getNFTTokensQuery, getNFTTokenByIDQuery } from '../queries/tokens.query'
import { MdArrowUpward } from 'react-icons/md'
import Text from './Text'
import useBalances, { STARS_MINIMAL_DENOM } from '../hooks/useBalances'

const { executeContract } = cosmwasm.wasm.v1.MessageComposer.withTypeUrl

export type SORT_ORDERS =
  | 'PRICE_DESC'
  | 'PRICE_ASC'
  | 'RARITY_DESC'
  | 'RARITY_ASC'
  | 'NAME_ASC'
  | 'NAME_DESC'
  | 'COLLECTION_ADDR_TOKEN_ID_ASC'
  | 'TOKEN_ID_DESC'
  | 'LISTED_ASC'
  | 'LISTED_DESC'

const STARGAZE_MARKET_CONTRACT =
  process.env.NEXT_PUBLIC_STARGAZE_MARKET_CONTRACT ||
  'stars1fvhcnyddukcqfnt7nlwv3thm5we22lyxyxylr9h77cvgkcn43xfsvgv0pl'

function createBuyNftTx({
  sender,
  collection,
  tokenId,
  expiry,
  funds,
}: {
  sender: string
  collection: string
  tokenId: number
  expiry: string
  funds: Array<{ amount: string; denom: string }>
}) {
  const tx = {
    msg: {
      buy_now: {
        collection: collection,
        token_id: tokenId,
        expires: expiry,
      },
    },
    memo: '',
    funds: funds,
  }

  const executeContractTx = executeContract({
    sender: sender,
    contract: STARGAZE_MARKET_CONTRACT,
    msg: toUtf8(JSON.stringify(tx.msg)),
    funds: funds,
  })

  return {
    typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
    value: executeContractTx.value,
  }
}

const BAD_KIDS_COLLECTION =
  process.env.NEXT_PUBLIC_BAD_KIDS_COLLECTION_ID ||
  'stars10n0m58ztlr9wvwkgjuek2m2k0dn5pgrhfw9eahg9p8e5qtvn964suc995j'

export function NFTs({
  collection,
  setIsElementsModalOpen,
}: {
  collection?: string
  setIsElementsModalOpen: (value: boolean) => void
}) {
  const { address, chain, status, getOfflineSignerDirect, openView, connect } = useChain('stargaze')
  const balances = useBalances()
  const [isFetching, setIsFetching] = useState(false)
  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (event: string) => {
    setSearchTerm(event)
  }

  const [sortOrder, setSortOrder] = useState<SORT_ORDERS>('PRICE_ASC')

  const {
    loading,
    error,
    data: result,
    fetchMore,
    refetch,
  } = useQuery(getNFTTokensQuery, {
    variables: {
      collectionAddr: collection ?? BAD_KIDS_COLLECTION,
      limit: 50,
      offset: 0,
      filterForSale: 'FIXED_PRICE',
      sortBy: sortOrder,
    },
  })

  const {
    loading: loading2,
    error: error2,
    data: searchedNFTResult,
    fetchMore: fetchMore2,
    refetch: refetch2,
  } = useQuery(getNFTTokenByIDQuery, {
    variables: {
      collectionAddr: collection ?? BAD_KIDS_COLLECTION,
      tokenId: searchTerm,
    },
  })

  const offset = useRef(0)
  const total = useRef(0)
  total.current = result?.tokens?.pageInfo?.total ?? 0
  offset.current = result?.tokens?.pageInfo?.offset ?? 0

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setIsScrollToTopVisible(true)
      } else {
        setIsScrollToTopVisible(false)
      }

      const totalPageHeight = document.documentElement.scrollHeight
      const scrollPoint = window.scrollY + window.innerHeight
      if (scrollPoint >= totalPageHeight && offset.current < total.current) {
        setIsFetching(true)
        fetchMore({
          variables: {
            offset: offset.current + 50,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev
            const tokensSet = new Set()
            const newTokens = [...prev.tokens.tokens]

            prev.tokens.tokens.forEach((token: any) => tokensSet.add(token.tokenId))
            fetchMoreResult.tokens.tokens.forEach((token: any) => {
              if (!tokensSet.has(token.tokenId)) {
                newTokens.push(token)
              }
            })

            return Object.assign({}, prev, {
              tokens: {
                pageInfo: fetchMoreResult.tokens.pageInfo,
                tokens: newTokens,
              },
            })
          },
        })
        setTimeout(() => {
          setIsFetching(false)
        }, 3000)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const nfts = useMemo(() => {
    return result?.tokens?.tokens
      ?.filter((token: any) => token.owner.address !== address)
      .map((token: any) => {
        let cta = 'Buy Now'
        if (address) {
          cta = 'Buy Now'
        }

        return {
          image: token.media.url,
          media_type: token.media.type,
          name: token.metadata.name,
          tokenId: token.tokenId,
          listPrice: token.listPrice,
          traits: token.traits,
          rarityOrder: token.rarityOrder,
          cta,
          collection: {
            name: token.collection.name,
            media_type: token.collection.media.type,
            image: token.collection.media.url,
            contractAddress: token.collection.contractAddress,
            tokenCount: token.collection.tokenCounts.total,
          },
        }
      })
      .filter((nft: any) => nft.tokenId.includes(searchTerm))
  }, [result, balances, searchTerm, status])

  const searchedNFT = useMemo(() => {
    const token = searchedNFTResult?.token

    let cta = 'Buy Now'
    if (address) {
      cta = 'Buy Now'
    }

    if (!token || !token?.listPrice) {
      console.log(token)
      return null
    }

    return {
      image: token.media?.url,
      media_type: token.media.type,
      name: token.metadata.name,
      tokenId: token.tokenId,
      listPrice: token.listPrice,
      traits: token.traits,
      rarityOrder: token.rarityOrder,
      cta,
      collection: {
        name: token.collection.name,
        media_type: token.collection.media.type,
        image: token.collection.media.url,
        contractAddress: token.collection.contractAddress,
        tokenCount: token.collection.tokenCounts.total,
      },
    }
  }, [searchedNFTResult, balances])

  const onnNFTClick = async (nft: any, title: string, subtitle: string, imgUrl?: string) => {
    if (!address) {
      connect()
      return
    }

    const shouldOpenModal = BN(nft.listPrice.amount).gt(
      balances?.[nft.listPrice.denom]?.amount ?? '0',
    )

    if (shouldOpenModal) {
      setIsElementsModalOpen(true)
      return
    }

    try {
      toast(`Please sign the transaction on your wallet`, {
        className: 'w-[400px]',
      })
      const twoWeekExpiry = 14 * 24 * 60 * 60 * 1000
      const tx = createBuyNftTx({
        sender: address,
        collection: nft.collection.contractAddress,
        tokenId: parseInt(nft.tokenId),
        expiry: ((Date.now() + twoWeekExpiry) * 1000_000).toString(),
        funds: [
          {
            denom: nft.listPrice.denom,
            amount: nft.listPrice.amount,
          },
        ],
      })

      const signer = getOfflineSignerDirect()

      const signingCosmwasmClient = await getSigningCosmwasmClient({
        rpcEndpoint: chain.apis?.rpc?.[0].address ?? '',
        //@ts-ignore
        signer: signer,
      })

      const fee = {
        amount: [
          {
            amount: '0',
            denom: STARS_MINIMAL_DENOM,
          },
        ],
        gas: '1000000',
      }

      const signedTx = await signingCosmwasmClient.sign(address, [tx], fee, '')
      const txRaw = TxRaw.encode({
        bodyBytes: signedTx.bodyBytes,
        authInfoBytes: signedTx.authInfoBytes,
        signatures: signedTx.signatures,
      }).finish()

      const res = signingCosmwasmClient.broadcastTx(txRaw)
      const broadcastToast = toast('Broadcasting transaction', {
        duration: 1000 * 60,
      })
      res
        .then((res: any) => {
          toast.dismiss(broadcastToast)
          toast.success(`Success! ${res.transactionHash}`, {
            className: 'w-[400px]',
          })
          refetch()
        })
        .catch((e: any) => {
          toast.dismiss(broadcastToast)
          toast.error(`Error: ${e.message}`, { className: 'w-[400px]' })
        })
    } catch (e: any) {
      toast.error(`Error: ${e.message}`)
    }
  }

  return (
    <div className='w-[90vw] mt-36 gap-3 flex flex-col '>
      <ListControl
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        sortOrder={sortOrder}
        handleSortChange={setSortOrder}
      />

      <div className='flex flex-wrap gap-x-3 gap-y-3 rounded-3xl border-[0] border-gray-100 shadow-[0_7px_24px_0px_rgba(0,0,0,0.25)] shadow-[0] dark:border-gray-900 sm:gap-x-6 sm:gap-y-8 sm:border mb-10'>
        {loading2 && nfts?.length === 0 && <GenericNFTCardSkeleton key={1} />}
        {!loading2 && !loading && nfts?.length === 0 && !searchedNFT && (
          <Text className='p-4' size='sm'>
            {`No NFTs found with the token ID "${searchTerm}"`}
          </Text>
        )}
        {searchedNFT && nfts?.length === 0 && (
          <GenericNFTCard
            nft={searchedNFT}
            key={searchedNFT.tokenId}
            onNFTClick={onnNFTClick}
            balances={balances}
            isConnected={status === 'Connected'}
          />
        )}
        {nfts &&
          nfts.map((nft: any) => (
            <GenericNFTCard
              nft={nft}
              key={nft.tokenId}
              onNFTClick={onnNFTClick}
              balances={balances}
              isConnected={status === 'Connected'}
            />
          ))}
        {(isFetching || loading) &&
          [1, 2, 3, 4, 5, 6, 7, 8].map((_, i) => {
            return <GenericNFTCardSkeleton key={i} />
          })}
      </div>
      {isScrollToTopVisible && (
        <div
          className='flex-row flex items-center gap-1 fixed  bottom-8 right-8 px-2 py-1 text-white-100 border border-white-100 rounded-3xl backdrop-blur-md bg-[#21212151]'
          onClick={scrollToTop}
        >
          {/* Icon Arrow Up */}
          <MdArrowUpward />
          <button>Top</button>
        </div>
      )}
    </div>
  )
}
