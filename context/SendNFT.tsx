// SendNFT Context

import { useQuery } from "@apollo/client";
import { useChain } from "@cosmos-kit/react";
import React, {
    createContext,
    Dispatch,
    SetStateAction,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import { usePreviousState } from "../hooks/usePreviousState";
import { getNFTTokenByOwner } from "../queries/tokens.query";

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
    error: Error | undefined;
    userNFTs: any[] | undefined;
    fetchMore: (args: any) => void;
    refetch: () => void;
    onNFTSelect: (nft: any) => void;
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
    error: undefined,
    userNFTs: undefined,
    fetchMore: () => {},
    refetch: () => {},
    onNFTSelect: () => {},
});

export function SendNFTProvider({ children }: { children: React.ReactNode }) {
    const [step, setStep] = useState<number>(0);
    const previousStep = usePreviousState(step);
    const [selectedNFT, setSelectedNFT] = useState<any | undefined>();
    const { address } = useChain("stargazetestnet");

    const [toAddress, setToAddress] = useState<string | undefined>();

    const {
        loading,
        error,
        data: result,
        fetchMore,
        refetch,
    } = useQuery(getNFTTokenByOwner, {
        variables: {
            ownerAddrOrName: address,
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
