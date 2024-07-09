import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Stack, Text, Button, useToast, Box } from "@chakra-ui/react";
import { InputEthereumAddress } from './InputEthereumAddress';
import { InputStarsAddress } from './InputStarsAddress';
import { signWithKeplr } from '../../utlis/keplr';
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
                } else if (!checkResponse.ok) {
                    throw new Error(
                        checkData.message || "Failed to check registration"
                    );
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
                    status: "warning",
                    description: `${checkData.message}. You can still proceed to sign and update your registration.`,
                    isClosable: true,
                    duration: null,
                });
                return;
            } else if (!checkResponse.ok) {
                throw new Error(
                    checkData.message || "Failed to check registration"
                );
            }

            const { signature, pubKey, data: encodedData } = await signWithKeplr(
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
                throw new Error(
                    `HTTP error! status: ${response.status}. Body: ${text}`
                );
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
                            colorScheme={isFormFilled && !wrongNetwork ? "purple" : "gray"}
                            border="1px solid white"
                            borderRadius="999px"
                            color="white"
                            _hover={isFormFilled && !wrongNetwork ? { bg: 'purple.600', borderColor: 'white' } : {}}
                            isDisabled={!isFormFilled || wrongNetwork}
                        >
                            {isFormFilled && !wrongNetwork ? "Sign" : "Fill all fields"}
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
}

export default SnapshotForm;
