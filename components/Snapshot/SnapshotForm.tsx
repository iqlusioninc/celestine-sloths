import { Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import {
    ChainWalletBase,
    MainWalletBase,
    WalletClient,
} from "@cosmos-kit/core";
import { useChain, useWallet, useWalletClient } from "@cosmos-kit/react";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { signWithCosmosWallet } from "../../utlis/cosmosWallet";
import { InputEthereumAddress } from "./InputEthereumAddress";
import { InputStarsAddress } from "./InputStarsAddress";
interface SnapshotFormProps {
    wrongNetwork: boolean;
}

export interface SnapshotFormValues {
    eth_address: string;
    stars_address: string;
}

const SnapshotForm: React.FC<SnapshotFormProps> = ({ wrongNetwork }) => {
    const methods = useForm<SnapshotFormValues>();
    const ethAddress = methods.watch("eth_address");
    const starsAddress = methods.watch("stars_address");
    const isFormFilled = ethAddress && starsAddress;
    const toast = useToast();
    const [registrationMessage, setRegistrationMessage] = useState("");

    const { chainWallet } = useChain("stargaze");

    useEffect(() => {
        const checkRegistration = async () => {
            if (!wrongNetwork) return;
    
            try {
                const checkResponse = await fetch("/api/checkRegistration", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ethAddress: ethAddress,
                        starsAddress: starsAddress,
                    }),
                });
    
                const checkData = await checkResponse.json();
    
                if (checkResponse.status === 409) {
                    setRegistrationMessage(checkData.message);
                    toast({
                        title: "Already Registered",
                        description: `${checkData.message}. You can still update your registration.`,
                        status: "warning",
                        isClosable: true,
                        duration: null,
                    });
                } else if (!checkResponse.ok) {
                    throw new Error(checkData.message || "Failed to check registration");
                }
            } catch (error) {
                console.error("Error checking registration: ", error);
            }
        };
    
        checkRegistration();
    }, [wrongNetwork, ethAddress, starsAddress]);

    const onSubmit = async (data: SnapshotFormValues) => {
        if (wrongNetwork) {
            toast({
                title: "Submission Error",
                status: "error",
                description: "Please check your wallet connection and network.",
                isClosable: true,
                duration: null,
            });
            return;
        }
    
        try {
            const checkResponse = await fetch("/api/checkRegistration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ethAddress: data.eth_address,
                    starsAddress: data.stars_address,
                }),
            });
    
            const checkData = await checkResponse.json();
    
            if (checkResponse.status === 409) {
                toast({
                    title: "Already Registered",
                    description: `${checkData.message}. You can still proceed to sign and update your registration.`,
                    status: "warning",
                    isClosable: true,
                    duration: null,
                });
                // Allow the user to proceed with the signing and update process
                proceedWithSigning(data);
            } else if (!checkResponse.ok) {
                throw new Error(checkData.message || "Failed to check registration");
            } else {
                proceedWithSigning(data);
            }
        } catch (error) {
            console.error("Error in form submission: ", error);
            toast({
                title: "Submission Error",
                status: "error",
                description: "There was an error during the submission process. Please try again.",
                isClosable: true,
                duration: null,
            });
        }
    };
    
    const proceedWithSigning = async (data: SnapshotFormValues) => {
        const { signature, pubKey, data: encodedData } = await signWithCosmosWallet(
            chainWallet as ChainWalletBase | undefined,
            data.eth_address,
            data.stars_address
        );
    
        const response = await fetch("/api/saveSignedMessage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                starsAddress: data.stars_address,
                ethAddress: data.eth_address,
                signature,
                pubKey,
                data: encodedData,
            }),
        });
    
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Body: ${text}`);
        }
    
        const responseData = await response.json();
        console.log("Response from server:", responseData);
        toast({
            title: "Success",
            status: "success",
            description: "Your addresses have been successfully signed.",
            isClosable: true,
            duration: null,
        });
    };
    
    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Stack spacing={4}>
                    <Text color="white">{registrationMessage ?? ""}</Text>
                    <InputEthereumAddress />
                    <br />
                    <InputStarsAddress />
                    <br />
                    <Box display="flex" justifyContent="center" width="100%">
                        <Button
                            mt={4}
                            height="40px"
                            width="200px"
                            fontSize="16px"
                            type="submit"
                            colorScheme={
                                isFormFilled && !wrongNetwork
                                    ? "purple"
                                    : "gray"
                            }
                            border="1px solid white"
                            borderRadius="999px"
                            color="white"
                            _hover={
                                isFormFilled && !wrongNetwork
                                    ? { bg: "purple.600", borderColor: "white" }
                                    : {}
                            }
                            isDisabled={!isFormFilled || wrongNetwork}
                        >
                            {isFormFilled && !wrongNetwork
                                ? "Sign"
                                : "Fill all fields"}
                        </Button>
                    </Box>
                    <br />
                    <Text color="white">
                        Re-link to update with a new wallet at any time.
                    </Text>
                </Stack>
            </form>
        </FormProvider>
    );
};

export default SnapshotForm;
