import { ApolloProvider as GraphqlProvider } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import { ElementsContainerDynamic } from "../components/Header";
import { NFTs } from "../components/NFTList";
import SendNFTsModal from "../components/SendNFTs/SendNFTsModal";
import { isValidAddressWithPrefix } from "../config/validateAddress";

import { useChain } from "@cosmos-kit/react";
import {
    AccountModal,
    Actions,
    defaultBlurs,
    defaultBorderRadii,
} from "@leapwallet/embedded-wallet-sdk-react";
import { testnetClient } from "../config/apolloclient";

export default function Home() {
    const [collection, setCollection] = useState<string | undefined>();
    const router = useRouter();

    const {
        status: walletConnectStatus,
        address,
        chain,
    } = useChain("stargazetestnet");
    const [isElementsModalOpen, setIsElementsModalOpen] =
        useState<boolean>(false);
    const [isSendNFTsModalOpen, setIsSendNFTsModalOpen] =
        useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const restURL = chain?.apis?.rest
        ? [0] && chain?.apis?.rest[0].address
        : "";
    const chainId = chain?.chain_id || "stargaze-1";

    const ClientAccountModal = () => {
        const ref = useRef();
        const [mounted, setMounted] = useState(false);

        useEffect(() => {
            ref.current = document.querySelector(
                "body"
            ) as unknown as undefined;
            setMounted(true);
        }, []);

        const theme = {
            colors: {
                primary: "#fff",
                border: "#fff",
                stepBorder: "#E8E8E8",
                backgroundPrimary: "#141414",
                backgroundSecondary: "#212121",
                text: "#fff",
                textSecondary: "#858585",
                gray: "#9ca3af",
                alpha: "#ffffff",
                error: "#420006",
                errorBackground: "#FFEBED",
                success: "#29A874",
                successBackground: "#DAF6EB",
            },
            borderRadii: defaultBorderRadii,
            blurs: defaultBlurs,
            fontFamily: "inherit",
        };

        const navigate = (path: string) => {
            window.open(`https://cosmos.leapwallet.io${path}`);
        };

        return mounted && isModalOpen ? (
            <AccountModal
                theme={theme}
                chainId={chainId}
                restUrl={restURL}
                address={address || ""}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                }}
                config={{
                    actionListConfig: {
                        [Actions.SEND]: {
                            onClick: (chainId) =>
                                navigate(
                                    `/transact/send?sourceChainId=${chainId}`
                                ),
                        },
                        [Actions.IBC]: {
                            onClick: (chainId) =>
                                navigate(
                                    `/transact/send?sourceChainId=${chainId}`
                                ),
                        },
                        [Actions.SWAP]: {
                            onClick: (chainId) =>
                                navigate(
                                    `/transact/swap?sourceChainId=${chainId}`
                                ),
                        },
                        [Actions.BRIDGE]: {
                            onClick: (chainId) =>
                                navigate(
                                    `/transact/bridge?destinationChainId=${chainId}`
                                ),
                        },
                        [Actions.BUY]: {
                            onClick: (chainId) =>
                                navigate(
                                    `/transact/buy?destinationChainId=${chainId}`
                                ),
                        },
                    },
                }}
            />
        ) : null;
    };

    useEffect(() => {
        if (typeof router.query.collectionAddress === "string") {
            if (
                isValidAddressWithPrefix(
                    router.query.collectionAddress,
                    "stars"
                )
            ) {
                setCollection(router.query.collectionAddress);
            }
        }
    }, [router.query]);

    return (
        <>
            <div>
                <div className="px-10 sm:px-14 justify-center align-middle items-center self-center origin-center">
                    <NFTs
                        setIsElementsModalOpen={setIsElementsModalOpen}
                        collection={collection}
                    />
                    <Toaster position="bottom-right" />
                </div>
                <ClientAccountModal />
                <ElementsContainerDynamic
                    isOpen={isElementsModalOpen}
                    setIsOpen={setIsElementsModalOpen}
                />
                <div className="leap-ui dark">
                    <GraphqlProvider client={testnetClient}>
                        <SendNFTsModal
                            isSendNFTsModalOpen={isSendNFTsModalOpen}
                            setIsSendNFTsModalOpen={setIsSendNFTsModalOpen}
                        />
                    </GraphqlProvider>
                </div>
            </div>
        </>
    );
}
