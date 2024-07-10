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

type InputViewProps = {
    setIsSendNFTsModalOpen: (isOpen: boolean) => void;
};

const InputView = ({ setIsSendNFTsModalOpen }: InputViewProps) => {
    const { selectedNFT, toAddress } = useSendNFT();
    const [inputStateActive, setInputStateActive] = useState<boolean>(true);

    useEffect(() => {
        if (!toAddress) {
            setInputStateActive(true);
        }
    }, [toAddress]);

    const isDisabled = useMemo(() => {
        return !selectedNFT || !toAddress;
    }, [selectedNFT, toAddress]);

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
            className=" p-6 flex flex-col justify-start items-start gap-6 w-full h-full"
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
            <div className="w-full flex flex-col justify-start items-start rounded-xl bg-card">
                <div className="pl-4 pr-3 py-3 text-sm font-medium text-card-foreground">
                    You’re sending
                </div>
                <div className="h-[1px] w-full bg-muted"></div>
                <AnimatePresence mode="popLayout">
                    {selectedNFT ? (
                        <NFTSelected nft={selectedNFT} />
                    ) : (
                        <NFTSelectButton />
                    )}
                </AnimatePresence>
            </div>
            <div className="w-full flex flex-col justify-start items-start rounded-xl bg-card">
                <div className="pl-4 pr-3 py-3 text-sm font-medium text-card-foreground">
                    To
                </div>
                <div className="h-[1px] w-full bg-muted"></div>
                <AnimatePresence mode="popLayout">
                    {inputStateActive ? (
                        <InputAddressArea
                            setInputStateActive={setInputStateActive}
                        />
                    ) : (
                        <InputAddressDisplay
                            setInputStateActive={setInputStateActive}
                        />
                    )}
                </AnimatePresence>
            </div>

            <Button
                className="w-full mt-auto rounded-full"
                disabled={isDisabled}
            >
                Send
            </Button>
        </motion.div>
    );
};

function InputAddressDisplay({
    setInputStateActive,
}: {
    setInputStateActive: (active: boolean) => void;
}) {
    const { setToAddress, toAddress } = useSendNFT();

    return (
        <motion.div
            key={"input-address-display"}
            transition={{
                duration: 0.2,
                stiffness: 80,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex group flex-row justify-between w-full items-center p-4 h-[60px] gap-4"
        >
            <div
                className=" cursor-pointer flex flex-row justify-start items-center gap-2 flex-1"
                onClick={() => {
                    setInputStateActive(true);
                }}
            >
                <FaCircleUser className="text-muted-foreground w-5 h-5" />
                <div className="flex-1 text-left font-bold text-sm leading-[20px] text-card-foreground">
                    {toAddress ? sliceAddress(toAddress) : ""}
                </div>
            </div>
            <FaCircleXmark
                onClick={() => {
                    setToAddress(undefined);
                }}
                className="cursor-pointer text-muted-foreground rounded-full w-4 h-4"
            />
        </motion.div>
    );
}

function InputAddressArea({
    setInputStateActive,
}: {
    setInputStateActive: (active: boolean) => void;
}) {
    const { setToAddress, toAddress } = useSendNFT();
    const ref = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.focus();
        }
    }, []);

    return (
        <motion.div
            key={"input-address-area"}
            transition={{
                duration: 0.2,
                stiffness: 80,
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex group flex-row justify-between w-full items-center p-4 h-[60px] gap-4"
        >
            <input
                className="font-bold text-lg text-card-foreground placeholder:text-muted-foreground bg-card outline-none"
                placeholder="Enter address"
                ref={ref}
                value={toAddress}
                onChange={(event) => {
                    setToAddress(event?.target?.value);
                }}
                onBlur={() => {
                    if (toAddress && toAddress.length > 0) {
                        setInputStateActive(false);
                    }
                }}
            />
            <button
                style={{ background: `#29A8741A` }}
                className="rounded-full px-3 py-1 text-primary font-bold text-sm"
                onClick={async () => {
                    try {
                        const text =
                            await window?.navigator?.clipboard?.readText();
                        setToAddress(text);
                    } catch {
                        //
                    }
                }}
            >
                Paste
            </button>
        </motion.div>
    );
}

function NFTSelectButton() {
    const { setStep } = useSendNFT();

    return (
        <motion.div
            key={"nft-select-button"}
            transition={{
                duration: 0.2,
                stiffness: 80,
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-row justify-between w-full items-center p-4 h-[60px] cursor-pointer"
            onClick={() => setStep(1)}
        >
            <div className="font-bold text-lg text-muted-foreground">
                Select NFTs
            </div>
            <FaChevronDown className="text-muted-foreground" />
        </motion.div>
    );
}

function NFTSelected({ nft }: { nft: any }) {
    const collection = nft?.collection?.name;
    const url = nft?.media?.visualAssets?.lg?.url;
    const id = nft.tokenId;

    const { setSelectedNFT } = useSendNFT();

    return (
        <motion.div
            key={"nft-selected"}
            transition={{
                duration: 0.2,
                stiffness: 80,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex flex-row justify-between w-full items-center gap-4 p-4 h-[60px]"
        >
            <div className="flex flex-row justify-start items-center gap-2 flex-1">
                <Image
                    src={url}
                    alt={id}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-sm overflow-hidden"
                />
                <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-sm font-bold !leading-[20px] text-foreground">
                    {collection} - {id}
                </div>
            </div>
            <FaCircleXmark
                onClick={() => {
                    setSelectedNFT(undefined);
                }}
                className="cursor-pointer text-muted-foreground rounded-full w-4 h-4"
            />
        </motion.div>
    );
}

export default InputView;
