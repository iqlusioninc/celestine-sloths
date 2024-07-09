import { useQuery } from "@apollo/client";

import { toUtf8 } from "@cosmjs/encoding";
import { useChain, useWalletClient } from "@cosmos-kit/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cosmwasm } from "stargazejs";
import { GenericNFTCard } from "./GenericNFTCard";

import toast from "react-hot-toast";
import { MdArrowUpward } from "react-icons/md";
import {
    getNFTTokenByIDQuery,
    getNFTTokensQuery,
} from "../queries/tokens.query";
import GenericNFTCardSkeleton from "./GenericNFTCardSkeleton";
import { ListControl } from "./ListControl";
import Text from "./Text";
import { queryNFTs, SlothTransferInfo, transferNFT } from "./sloth";
import { WalletClient } from "@cosmos-kit/core";

const { executeContract } = cosmwasm.wasm.v1.MessageComposer.withTypeUrl;

export type SORT_ORDERS =
    | "PRICE_DESC"
    | "PRICE_ASC"
    | "RARITY_DESC"
    | "RARITY_ASC"
    | "NAME_ASC"
    | "NAME_DESC"
    | "COLLECTION_ADDR_TOKEN_ID_ASC"
    | "TOKEN_ID_DESC"
    | "LISTED_ASC"
    | "LISTED_DESC";

const STARGAZE_MARKET_CONTRACT =
    process.env.NEXT_PUBLIC_STARGAZE_MARKET_CONTRACT ||
    "stars1fvhcnyddukcqfnt7nlwv3thm5we22lyxyxylr9h77cvgkcn43xfsvgv0pl";

function createBuyNftTx({
    sender,
    collection,
    tokenId,
    expiry,
    funds,
}: {
    sender: string;
    collection: string;
    tokenId: number;
    expiry: string;
    funds: Array<{ amount: string; denom: string }>;
}) {
    const tx = {
        msg: {
            buy_now: {
                collection: collection,
                token_id: tokenId,
                expires: expiry,
            },
        },
        memo: "",
        funds: funds,
    };

    const executeContractTx = executeContract({
        sender: sender,
        contract: STARGAZE_MARKET_CONTRACT,
        msg: toUtf8(JSON.stringify(tx.msg)),
        funds: funds,
    });

    return {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: executeContractTx.value,
    };
}

export const BAD_KIDS_COLLECTION =
    process.env.NEXT_PUBLIC_BAD_KIDS_COLLECTION_ID ||
    "stars10n0m58ztlr9wvwkgjuek2m2k0dn5pgrhfw9eahg9p8e5qtvn964suc995j";

export function NFTs({
    collection,
    setIsElementsModalOpen,
}: {
    collection?: string;
    setIsElementsModalOpen: (value: boolean) => void;
}) {
    const {
        address,
        chain,
        status,
        getOfflineSignerDirect,
        openView,
        connect,
    } = useChain("stargazetestnet");

    const { client } = useWalletClient();

    console.log(address);
    const [balance, setBalance] = useState<string>("0");
    const [isFetching, setIsFetching] = useState(false);
    const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (event: string) => {
        setSearchTerm(event);
    };

    const [sortOrder, setSortOrder] = useState<SORT_ORDERS>("PRICE_ASC");

    const {
        loading,
        error,
        data: result,
        fetchMore,
        refetch,
    } = useQuery(getNFTTokensQuery, {
        variables: {
            collectionAddr: collection ?? BAD_KIDS_COLLECTION,
            limit: 30,
            offset: 0,
            filterForSale: "FIXED_PRICE",
            sortBy: sortOrder,
        },
    });

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
    });

    const offset = useRef(0);
    const total = useRef(0);
    total.current = result?.tokens?.pageInfo?.total ?? 0;
    offset.current = result?.tokens?.pageInfo?.offset ?? 0;

    useEffect(() => {
        const getBalance = async () => {
            const res = await fetch(
                `${chain.apis?.rest?.[0].address}/cosmos/bank/v1beta1/balances/${address}`
            );
            const response = await res.json();
            const starsBalance = response.balances.find(
                (balance: any) => balance.denom === "ustars"
            );

            setBalance(starsBalance?.amount ?? "0");
        };
        if (address) {
            getBalance();
        }
    }, [address]);

    // Set the top cordinate to 0
    // make scrolling smooth
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.pageYOffset > 300) {
                setIsScrollToTopVisible(true);
            } else {
                setIsScrollToTopVisible(false);
            }

            const totalPageHeight = document.documentElement.scrollHeight;
            const scrollPoint = window.scrollY + window.innerHeight;
            if (
                scrollPoint >= totalPageHeight &&
                offset.current < total.current
            ) {
                setIsFetching(true);
                fetchMore({
                    variables: {
                        offset: offset.current + 50,
                    },
                    updateQuery: (prev, { fetchMoreResult }) => {
                        if (!fetchMoreResult) return prev;
                        const tokensSet = new Set();
                        const newTokens = [...prev.tokens.tokens];

                        prev.tokens.tokens.forEach((token: any) =>
                            tokensSet.add(token.tokenId)
                        );
                        fetchMoreResult.tokens.tokens.forEach((token: any) => {
                            if (!tokensSet.has(token.tokenId)) {
                                newTokens.push(token);
                            }
                        });

                        return Object.assign({}, prev, {
                            tokens: {
                                pageInfo: fetchMoreResult.tokens.pageInfo,
                                tokens: newTokens,
                            },
                        });
                    },
                });
                setTimeout(() => {
                    setIsFetching(false);
                }, 3000);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const nfts = useMemo(() => {
        return result?.tokens?.tokens
            ?.filter((token: any) => token.owner.address !== address)
            .map((token: any) => {
                let cta = "Buy Now";
                if (address) {
                    cta = "Buy Now";
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
                };
            })
            .filter((nft: any) => nft.tokenId.includes(searchTerm));
    }, [result, balance, searchTerm, status]);

    const searchedNFT = useMemo(() => {
        const token = searchedNFTResult?.token;

        let cta = "Buy Now";
        if (address) {
            cta = "Buy Now";
        }

        if (!token || !token?.listPrice) {
            console.log(token);
            return null;
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
        };
    }, [searchedNFTResult, balance]);

    const onnNFTClick = async (
        nft: any,
        title: string,
        subtitle: string,
        imgUrl?: string
    ) => {
        if (!client || !client?.getAccount) {
            return;
        }

        const senderChainInfo = SlothTransferInfo.lazy;
        const receiverChainInfo = SlothTransferInfo.stargaze;

        const {
            chainId,
            rpcUrl,
            nftContract,
            ICS721Contract,
            ICS721ChannelID,
        } = senderChainInfo;

        const {
            chainId: receiverChainId,
            rpcUrl: receiverRpcUrl,
            nftContract: receiverNftContract,
        } = receiverChainInfo;

        const senderAccount = await client?.getAccount(chainId);
        const sender = senderAccount?.address || "";

        const receiverAccount = await client?.getAccount(receiverChainId);
        const receiver = receiverAccount?.address || "";

        const senderNFTs = await queryNFTs(rpcUrl, nftContract, sender);

        console.log({ senderNFTs });

        const receiverNFTs = await queryNFTs(
            receiverRpcUrl,
            receiverNftContract,
            receiver
        );

        console.log({ receiverNFTs });

        const res = transferNFT({
            client: client as WalletClient,
            chainId,
            rpcUrl,
            nftContract,
            ICS721Contract,
            tokenId: "2494",
            sender,
            receiver,
            ICS721ChannelID,
        });

        const broadcastToast = toast("Broadcasting transaction", {
            duration: 1000 * 60,
        });
        res.then((res: any) => {
            toast.dismiss(broadcastToast);
            toast.success(`Success! ${res.transactionHash}`, {
                className: "w-[400px]",
            });
            refetch();
        }).catch((e: any) => {
            toast.dismiss(broadcastToast);
            toast.error(`Error: ${e.message}`, { className: "w-[400px]" });
        });

        return;
    };

    return (
        <div className="w-[90vw] mt-36 gap-3 flex flex-col ">
            <ListControl
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
                sortOrder={sortOrder}
                handleSortChange={setSortOrder}
            />

            <div className="flex flex-wrap gap-x-3 gap-y-3 rounded-3xl border-[0] border-gray-100 shadow-[0_7px_24px_0px_rgba(0,0,0,0.25)] shadow-[0] dark:border-gray-900 sm:gap-x-6 sm:gap-y-8 sm:border mb-10">
                {loading2 && nfts?.length === 0 && (
                    <GenericNFTCardSkeleton key={1} />
                )}
                {!loading2 &&
                    !loading &&
                    nfts?.length === 0 &&
                    !searchedNFT && (
                        <Text className="p-4" size="sm">
                            {`No NFTs found with the token ID "${searchTerm}"`}
                        </Text>
                    )}
                {searchedNFT && nfts?.length === 0 && (
                    <GenericNFTCard
                        nft={searchedNFT}
                        key={searchedNFT.tokenId}
                        onNFTClick={onnNFTClick}
                        balance={balance}
                        isConnected={status === "Connected"}
                    />
                )}
                {nfts &&
                    nfts.map((nft: any) => (
                        <GenericNFTCard
                            nft={nft}
                            key={nft.tokenId}
                            onNFTClick={onnNFTClick}
                            balance={balance}
                            isConnected={status === "Connected"}
                        />
                    ))}
                {(isFetching || loading) &&
                    [1, 2, 3, 4, 5, 6, 7, 8].map((_, i) => {
                        return <GenericNFTCardSkeleton key={i} />;
                    })}
            </div>
            {isScrollToTopVisible && (
                <div
                    className="flex-row flex items-center gap-1 fixed  bottom-8 right-8 px-2 py-1 text-white-100 border border-white-100 rounded-3xl backdrop-blur-md bg-[#21212151]"
                    onClick={scrollToTop}
                >
                    {/* Icon Arrow Up */}
                    <MdArrowUpward />
                    <button>Top</button>
                </div>
            )}
        </div>
    );
}
