import React from "react";
import { Heading, VStack, Text, Box, Stack } from "@chakra-ui/react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { FormProvider, useForm } from 'react-hook-form';
import SnapshotForm from './SnapshotForm';

export interface SnapshotFormValues {
    eth_address: string;
    stars_address: string;
}
export const STARGAZE_CHAIN_ID = "stargaze"

export const SnapshotCard: React.FC = () => {
    const { isConnected } = useAccount();
    const { chain: wagmiChain } = useNetwork();
    const { switchNetworkAsync } = useSwitchNetwork();
    const methods = useForm<SnapshotFormValues>({
        defaultValues: {
            eth_address: "",
            stars_address: "",
        },
    });

    const ethChainWagmiId = 1;
    const ethChainId = 1; // Ethereum Mainnet ID
    const isWrongNetwork = !!wagmiChain && wagmiChain.id !== ethChainId;

    return (
        <>
            {isConnected && isWrongNetwork && (
                <Box
                    p={4}
                    mb={12}
                    backgroundColor="gray.950"
                    border="2px solid"
                    borderRadius={16}
                    borderColor="gray.700"
                    width="full"
                    zIndex={2}
                    boxShadow="-11px 15px 23.4px 0px rgba(0, 0, 0, 0.41)"
                >
                    <VStack spacing={4}>
                        <Heading size="md" color="white">
                            <Text color="white">Wrong Network</Text>
                        </Heading>
                        <Text color="white">
                            Your connected wallet is on the {wagmiChain?.name} network. Please switch to Ethereum Mainnet to use this feature.
                        </Text>
                        <button
                            onClick={async () => {
                                try {
                                    if (switchNetworkAsync) {
                                        await switchNetworkAsync(ethChainWagmiId);
                                        window.location.reload();
                                    }
                                } catch (e) {
                                    const error = e as Error;
                                    console.error(error);
                                }
                            }}
                        >
                            Switch to Ethereum Mainnet
                        </button>
                    </VStack>
                </Box>
            )}
            <Stack
                direction={{ base: "column", md: "row" }}
                spacing={10}
                width="full"
            >
                <Box
                    maxW="432px"
                    w="full"
                    boxShadow="-11px 15px 23.4px 0px rgba(0, 0, 0, 0.41)"
                    px={{ base: 5, md: 12 }}
                    pt="150px"
                    pb="48px"
                    borderRadius={{ base: "32px", md: "40px" }}
                    mx={4}
                    backgroundColor="gray.950"
                >
    <Heading
        textAlign="center"
        mb={20}
        color="white"
         fontWeight="bold"

    >
        Snapshot
    </Heading>
                    <Text mb={4} color="white">
                        Link your wallets for bonus rewards and/or participate in partner campaigns.
                    </Text>
                    <br />
                    <FormProvider {...methods}>
                        <SnapshotForm wrongNetwork={isWrongNetwork} />
                    </FormProvider>
                </Box>
                {/*<CampaignTable />*/}
            </Stack>
        </>
    );
};

export default SnapshotCard;
