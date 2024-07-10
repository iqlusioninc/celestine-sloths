// SendNFT Context

import { useQuery } from "@apollo/client";
import { useChain } from "@cosmos-kit/react";
import React, {
    createContext,
    Dispatch,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { usePreviousState } from "../hooks/usePreviousState";
import { getNFTTokenByOwner } from "../queries/tokens.query";
import toast from "react-hot-toast";
import { queryNFTs, SlothTransferInfo, transferNFT } from "../components/sloth";
import { WalletClient } from "@cosmos-kit/core";

export type SendNFTContextType = {
    step: number;
    setStep: Dispatch<SetStateAction<number>>;
    previousStep: number | undefined;
    selectedNFT: any | undefined;
    setSelectedNFT: (nft: any | undefined) => void;
    toAddress: string | undefined;
    setToAddress: Dispatch<SetStateAction<string | undefined>>;
    address: string | undefined;
    loading: boolean;
    userNFTs: any[] | undefined;
    fetchMore: (args: any) => void;
    refetch: () => void;
    error: string | undefined;
    isSendTxnLoading: boolean;
    inputStateActive: boolean;
    setInputStateActive: Dispatch<SetStateAction<boolean>>;
    onNFTSelect: (nft: any) => void;
    txHash: string | undefined;
    handleSendNFT: () => void;
};

const SendNFTContext = createContext<SendNFTContextType>({
    step: 0,
    setStep: () => {},
    previousStep: undefined,
    selectedNFT: undefined,
    setSelectedNFT: () => {},
    toAddress: undefined,
    setToAddress: () => {},
    address: undefined,
    loading: false,
    userNFTs: undefined,
    fetchMore: () => {},
    refetch: () => {},
    error: undefined,
    isSendTxnLoading: false,
    inputStateActive: true,
    setInputStateActive: () => {},
    onNFTSelect: () => {},
    handleSendNFT: () => {},
    txHash: undefined,
});

export function SendNFTProvider({ children }: { children: React.ReactNode }) {
    const [step, setStep] = useState<number>(0);
    const [error, setError] = useState<string | undefined>();
    const previousStep = usePreviousState(step);
    const [selectedNFT, setSelectedNFT] = useState<any | undefined>();
    const { address, chainWallet } = useChain("stargazetestnet");
    const [isSendTxnLoading, setIsSendTxnLoading] = useState<boolean>(false);
    const [toAddress, setToAddress] = useState<string | undefined>();
    const [inputStateActive, setInputStateActive] = useState<boolean>(true);
    const [txHash, setTxHash] = useState<string | undefined>();

    const client = useMemo(() => {
        return chainWallet?.client;
    }, [chainWallet]);

    const {
        loading,
        error: errorNFTs,
        data: result,
        fetchMore,
        refetch,
    } = useQuery(getNFTTokenByOwner, {
        variables: {
            ownerAddrOrName: address,
            collectionAddr: SlothTransferInfo.stargaze.nftContract,
            limit: 100,
            offset: 0,
            sortBy: "COLLECTION_ADDR_TOKEN_ID_ASC",
        },
    });

    const userNFTs = useMemo(() => {
        return result?.tokens?.tokens;
    }, [result?.tokens?.tokens]);

    const onNFTSelect = useCallback(
        (nft: any) => {
            setSelectedNFT(nft);
            setStep(0);
        },
        [setStep, setSelectedNFT]
    );

    const handleSendNFT = useCallback(async () => {
        if (step === 2) {
            setStep(0);
            setSelectedNFT(undefined);
            return;
        }

        if (!selectedNFT || !toAddress || !!error) {
            return;
        }

        setIsSendTxnLoading(true);
        try {
            if (!client || !client?.getAccount) {
                return;
            }

            const senderChainInfo = SlothTransferInfo.stargaze;
            const receiverChainInfo = SlothTransferInfo.lazy;
            const nftContract = selectedNFT?.collection?.contractAddress;

            const { chainId, rpcUrl, ICS721Contract, ICS721ChannelID } =
                senderChainInfo;

            const {
                chainId: receiverChainId,
                rpcUrl: receiverRpcUrl,
                nftContract: receiverNftContract,
            } = receiverChainInfo;

            const senderAccount = await client?.getAccount(chainId);
            const sender = senderAccount?.address || "";

            const receiver = toAddress;

            const senderNFTs = await queryNFTs(rpcUrl, nftContract, sender);

            console.log({ senderNFTs });

            let receiverNFTs = await queryNFTs(
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
                tokenId: selectedNFT?.tokenId,
                sender,
                receiver,
                ICS721ChannelID,
            });

            const broadcastToast = toast("Broadcasting transaction", {
                duration: 1000 * 60,
            });
            try {
                const txRes = await res;
                toast.dismiss(broadcastToast);
                toast.success(`Success! ${txRes?.transactionHash}`, {
                    className: "w-[400px]",
                });
                refetch();
                setStep(2);
                setTxHash(txRes?.transactionHash);
            } catch (e) {
                toast.dismiss(broadcastToast);
                toast.error(`Error: ${(e as Error)?.message}`, {
                    className: "w-[400px]",
                });
            }

            console.log("post txn");
            receiverNFTs = await queryNFTs(
                receiverRpcUrl,
                receiverNftContract,
                receiver
            );

            console.log({ receiverNFTs });
        } catch (e) {
            setError("Failed to send NFT" + (e as Error)?.message);
        }
        setIsSendTxnLoading(false);
    }, [client, error, refetch, selectedNFT, step, toAddress]);

    useEffect(() => {
        if (!inputStateActive && toAddress && !toAddress?.startsWith("lazy")) {
            setError("Enter a lazy chain address");
        } else {
            setError(undefined);
        }
    }, [inputStateActive, toAddress]);

    return (
        <SendNFTContext.Provider
            value={{
                step,
                previousStep,
                toAddress,
                setToAddress,
                selectedNFT,
                onNFTSelect,
                loading,
                error,
                userNFTs,
                fetchMore,
                refetch,
                setSelectedNFT,
                setStep,
                address,
                inputStateActive,
                setInputStateActive,
                isSendTxnLoading,
                handleSendNFT,
                txHash,
            }}
        >
            {children}
        </SendNFTContext.Provider>
    );
}

export const useSendNFT = () => {
    const context = useContext(SendNFTContext);
    if (!context) {
        throw new Error("useSendNFT must be used within a SendNFTProvider");
    }

    return context;
};
