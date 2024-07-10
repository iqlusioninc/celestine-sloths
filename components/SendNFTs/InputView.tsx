import { Button } from "@leapwallet/react-ui";
import { motion } from "framer-motion";
import React from "react";
import {
    FaChevronDown,
    FaCircleUser,
    FaCircleXmark,
    FaXmark,
} from "react-icons/fa6";
import { useSendNFT } from "../../context/SendNFT";
import Image from "next/image";

type InputViewProps = {
    setIsSendNFTsModalOpen: (isOpen: boolean) => void;
};

const InputView = ({ setIsSendNFTsModalOpen }: InputViewProps) => {
    const { selectedNFT, setStep, toAddress, setToAddress } = useSendNFT();

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
                {selectedNFT ? (
                    <NFTSelected nft={selectedNFT} />
                ) : (
                    <NFTSelectButton />
                )}
            </div>
            <div className="w-full flex flex-col justify-start items-start rounded-xl bg-card">
                <div className="pl-4 pr-3 py-3 text-sm font-medium text-card-foreground">
                    To
                </div>
                <div className="h-[1px] w-full bg-muted"></div>
                <div className="flex group flex-row justify-between w-full items-center p-4">
                    <InputAddressArea />
                    <InputAddressDisplay />
                </div>
            </div>

            <Button className="w-full mt-auto rounded-full" disabled={true}>
                Send
            </Button>
        </motion.div>
    );
};

function InputAddressDisplay() {
    const { setSelectedNFT } = useSendNFT();
    return (
        <>
            <div className="block group-focus:hidden flex flex-row justify-start items-center gap-2">
                <FaCircleUser className=" w-5 h-5" />
            </div>
            <FaCircleXmark
                onClick={() => {
                    setSelectedNFT(undefined);
                }}
                className="block group-focus:hidden cursor-pointer text-card-foreground rounded-full w-4 h-4"
            />
        </>
    );
}

function InputAddressArea() {
    const { setToAddress, toAddress } = useSendNFT();

    return (
        <>
            <input
                className="hidden group-focus:block font-bold text-lg text-muted-foreground bg-card outline-none"
                placeholder="Enter address"
                value={toAddress}
                onChange={(event) => {
                    setToAddress(event?.target?.value);
                }}
            />
            <button
                style={{ background: `#29A8741A` }}
                className="hidden group-focus:block rounded-full px-3 py-1 text-primary font-bold text-sm"
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
        </>
    );
}

function NFTSelectButton() {
    const { setStep } = useSendNFT();

    return (
        <div
            className="flex flex-row justify-between w-full items-center p-4 cursor-pointer"
            onClick={() => setStep(1)}
        >
            <div className="font-bold text-lg text-muted-foreground">
                Select NFTs
            </div>
            <FaChevronDown className="text-muted-foreground" />
        </div>
    );
}

function NFTSelected({ nft }: { nft: any }) {
    const collection = nft?.collection?.name;
    const url = nft?.media?.visualAssets?.lg?.url;
    const id = nft.tokenId;

    const { setSelectedNFT } = useSendNFT();

    return (
        <div className="flex flex-row justify-between w-full items-center gap-4 p-4">
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
                className="cursor-pointer text-card-foreground rounded-full w-4 h-4"
            />
        </div>
    );
}

export default InputView;
