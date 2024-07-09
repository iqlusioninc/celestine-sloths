import {
    Box,
    FormErrorMessage,
    HStack,
    Input,
    InputProps,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";
import { useChain } from "@cosmos-kit/react";
import React, { useEffect, useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { SnapshotFormValues } from "./SnapshotCard";

export const InputStarsAddress: React.FC<InputProps> = ({
    children,
    ...rest
}) => {
    const toast = useToast();
    const { register, setValue, getFieldState } =
        useFormContext<SnapshotFormValues>();
    const isError = !!getFieldState("stars_address").error;
    const { address, openView } = useChain("stargaze");

    const [lookForAddressChange, setLookForAddressChange] =
        useState<boolean>(false);

    const onAutofillClick = useCallback(async () => {
        if (!address) {
            openView();
            setLookForAddressChange(true);
        } else {
            setValue("stars_address", address, {
                shouldValidate: true,
            });
            setLookForAddressChange(false);
        }
    }, [address, openView, setValue, setLookForAddressChange]);

    useEffect(() => {
        if (!lookForAddressChange) {
            return;
        }
        if (lookForAddressChange && address) {
            setValue("stars_address", address, {
                shouldValidate: true,
            });
            setLookForAddressChange(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, lookForAddressChange]);

    return (
        <Stack spacing={2}>
            <HStack justifyContent="space-between">
                <Text fontWeight="bold" color="white" fontSize="sm">
                    Stars Address
                </Text>
                <HStack
                    as="button"
                    type="button"
                    spacing={1}
                    onClick={onAutofillClick}
                    color="white"
                >
                    <Text fontWeight="bold" fontSize="sm">
                        Import from Cosmos Wallet
                    </Text>
                </HStack>
            </HStack>
            <Box
                boxShadow={isError ? "redOutline1" : "purpleOutline1"}
                borderRadius="16px"
            >
                <Input
                    id="sommelierAddress"
                    placeholder="Enter Stargaze address"
                    fontSize="sm"
                    fontWeight={700}
                    backgroundColor="gray.950"
                    color="black"
                    variant="unstyled"
                    borderRadius="16px"
                    px={4}
                    py={6}
                    maxH="64px"
                    type="text"
                    {...register("stars_address", {
                        required: "Enter Stargaze address",
                    })}
                    autoComplete="off"
                    autoCorrect="off"
                    {...rest}
                />
            </Box>
            {isError && (
                <FormErrorMessage>
                    <HStack spacing="6px">
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="red.300"
                        >
                            Address is not valid—make sure Sommelier address is
                            from a Cosmos wallet
                        </Text>
                    </HStack>
                </FormErrorMessage>
            )}
        </Stack>
    );
};
