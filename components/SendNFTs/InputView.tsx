import { Button } from "@leapwallet/react-ui";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import {
    FaChevronDown,
    FaCircleUser,
    FaCircleXmark,
    FaXmark,
} from "react-icons/fa6";
import { useSendNFT } from "../../context/SendNFT";
import Image from "next/image";
import { sliceAddress } from "../../config/formatAddress";
import Spinner from "./Spinner";
import SuccessView from "./SuccessView";
import InputArea from "./InputArea";

type InputViewProps = {
    setIsSendNFTsModalOpen: (isOpen: boolean) => void;
};

const InputView = ({ setIsSendNFTsModalOpen }: InputViewProps) => {
    const {
        selectedNFT,
        toAddress,
        inputStateActive,
        setInputStateActive,
        error,
        isSendTxnLoading,
        handleSendNFT,
        step,
    } = useSendNFT();

    useEffect(() => {
        if (!toAddress) {
            setInputStateActive(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toAddress]);

    const isDisabled = useMemo(() => {
        return !!error || !selectedNFT || !toAddress;
    }, [selectedNFT, error, toAddress]);

    return (
        <motion.div
            key={0}
            transition={{
                duration: 0.2,
                stiffness: 80,
            }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="p-6 flex flex-col justify-start items-start gap-4 w-full h-full"
        >
            <div className="flex flex-row justify-between items-center w-full gap-4">
                <div className="text-md font-bold !leading-[21.6px] text-foreground">
                    Send NFTs
                </div>
                <button
                    onClick={() => {
                        setIsSendNFTsModalOpen(false);
                    }}
                    className="rounded-full p-2 bg-card hover:bg-muted"
                >
                    <FaXmark />
                </button>
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
                {step === 0 && <InputArea />}
                {step === 2 && <SuccessView />}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
                {!isSendTxnLoading ? (
                    <motion.div
                        key={"btn"}
                        transition={{
                            duration: 0.2,
                            stiffness: 80,
                        }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="mt-auto w-full"
                    >
                        <Button
                            className="w-full rounded-full"
                            disabled={isDisabled}
                            classNames=""
                            onClick={handleSendNFT}
                        >
                            Send
                        </Button>
                    </motion.div>
                ) : (
                    <div className="mt-auto w-full flex justify-center">
                        <Spinner size="30" className="z-[2]" />
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default InputView;
