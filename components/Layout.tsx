import { useEffect, useRef, useState } from "react"
import { Box, Container, Flex, FlexProps } from "@chakra-ui/react"
import { ElementsContainerDynamic, Header } from './Header';
import { AccountModal, Actions, defaultBlurs, defaultBorderRadii } from '@leapwallet/embedded-wallet-sdk-react';
import { useChain } from '@cosmos-kit/react';

export const Layout = ({ children, ...rest }: FlexProps) => {


    const { address, chain } = useChain("stargaze");

    const restURL = chain?.apis?.rest ? [0] && chain?.apis?.rest[0].address : "";
    const chainId = chain?.chain_id || "stargaze-1";

    const [isElementsModalOpen, setIsElementsModalOpen] =
        useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const ClientAccountModal = () => {
        const ref = useRef();
        const [mounted, setMounted] = useState(false);

        useEffect(() => {
            ref.current = document.querySelector("body") as unknown as undefined;
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
                                navigate(`/transact/send?sourceChainId=${chainId}`),
                        },
                        [Actions.IBC]: {
                            onClick: (chainId) =>
                                navigate(`/transact/send?sourceChainId=${chainId}`),
                        },
                        [Actions.SWAP]: {
                            onClick: (chainId) =>
                                navigate(`/transact/swap?sourceChainId=${chainId}`),
                        },
                        [Actions.BRIDGE]: {
                            onClick: (chainId) =>
                                navigate(`/transact/bridge?destinationChainId=${chainId}`),
                        },
                        [Actions.BUY]: {
                            onClick: (chainId) =>
                                navigate(`/transact/buy?destinationChainId=${chainId}`),
                        },
                    },
                }}
            />
        ) : null;
    };

    return (
            <Box display="block">
                <Flex minH="100vh" flexDir="column" {...rest}>
                    <Header
                        openEmbeddedWalletModal={() => {
                            setIsModalOpen(true);
                        }}
                        setIsElementsModalOpen={setIsElementsModalOpen}
                    />
                    <Container
                        as="main"
                        flex={1}
                        pt={5}
                        px={{ base: 0, sm: 4 }}
                    >
                        {children}
                    </Container>

                    <ClientAccountModal />
                    <ElementsContainerDynamic
                        isOpen={isElementsModalOpen}
                        setIsOpen={setIsElementsModalOpen}
                    />
                </Flex>
            </Box>
    )
}
