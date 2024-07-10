import { motion } from "framer-motion";
import React, { useCallback, useState } from "react";
import { useSendNFT } from "../../context/SendNFT";
import { SendSuccessfulIcon } from "./SendSuccessfulIcon";
import Image from "next/image";
import { FaCheck, FaCircleUser, FaCopy } from "react-icons/fa6";
import { sliceAddress } from "../../config/formatAddress";
import classNames from "classnames";

type Props = {};

const SuccessView = (props: Props) => {
    const { toAddress, selectedNFT, txHash } = useSendNFT();
    const [copied, setCopied] = useState<boolean>(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(txHash || "");
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }, [txHash]);

    const collection = selectedNFT?.collection?.name;
    const url = selectedNFT?.media?.visualAssets?.lg?.url;
    const id = selectedNFT.tokenId;

    return (
        <motion.div
            key={"input-area"}
            transition={{
                duration: 0.2,
                stiffness: 80,
            }}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="flex flex-col justify-start items-start gap-4 w-full h-full"
        >
            <div className="w-full flex flex-col justify-start items-center rounded-xl bg-card p-4">
                <SendSuccessfulIcon />
                <div className="flex flex-col justify-start items-center gap-2 max-w-full">
                    <div className="flex flex-row justify-start items-center bg-muted gap-2 p-2 max-w-full rounded-sm">
                        <Image
                            src={url}
                            alt={id}
                            width={24}
                            height={24}
                            className="rounded-sm overflow-hidden"
                        />
                        <div className="flex-1 max-w-max overflow-hidden whitespace-nowrap text-ellipsis text-sm font-bold !leading-[20px] text-sm !leading-[24px] font-bold text-foreground">
                            {collection} - {id}
                        </div>
                    </div>
                    <span className="text-muted-foreground text-sm !leading-[22.4px] font-medium">
                        sent successfully to
                    </span>
                    <div className="flex flex-row justify-center items-center gap-2 py-[6px] pl-[12px] pr-[16px] rounded-full bg-muted">
                        <FaCircleUser />
                        <span className="text-foreground text-md !leading-[25.4px] font-medium">
                            {toAddress ? sliceAddress(toAddress) : ""}
                        </span>
                    </div>
                </div>
            </div>
            <div className="w-full flex flex-between justify-between items-center rounded-xl bg-card py-4 px-6 gap-3">
                <div className="flex flex-col justify-center items-start gap-1">
                    <span className="text-foreground text-md font-bold !leading-[21.6px]">
                        Transaction ID
                    </span>
                    <span className="text-muted-foreground text-md font-medium !leading-[25.6px]">
                        {txHash ? sliceAddress(txHash) : ""}
                    </span>
                </div>
                <div className="flex flex-row justify-start items-center gap-[12px]">
                    <button
                        className={classNames(
                            "rounded-full h-[36px] w-[36px] flex flex-row transition-all ease-in-out duration-300 justify-center items-center gap-1 rounded-full",
                            {
                                "bg-muted": !copied,
                                "bg-primary": copied,
                            }
                        )}
                        onClick={handleCopy}
                    >
                        {copied ? <FaCheck /> : <CopyIcon />}
                    </button>
                    <button
                        onClick={() => {
                            window.open(
                                `https://testnet.ping.pub/stargaze/tx/${txHash}`,
                                "_blank"
                            );
                        }}
                        className="rounded-full h-[36px] w-[36px] flex flex-row justify-center items-center gap-1 bg-muted rounded-full"
                    >
                        <LaunchIcon />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

function LaunchIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M15 15.8333H5C4.54167 15.8333 4.16667 15.4583 4.16667 15V5C4.16667 4.54167 4.54167 4.16667 5 4.16667H9.16667C9.625 4.16667 10 3.79167 10 3.33333C10 2.875 9.625 2.5 9.16667 2.5H4.16667C3.24167 2.5 2.5 3.25 2.5 4.16667V15.8333C2.5 16.75 3.25 17.5 4.16667 17.5H15.8333C16.75 17.5 17.5 16.75 17.5 15.8333V10.8333C17.5 10.375 17.125 10 16.6667 10C16.2083 10 15.8333 10.375 15.8333 10.8333V15C15.8333 15.4583 15.4583 15.8333 15 15.8333ZM11.6667 3.33333C11.6667 3.79167 12.0417 4.16667 12.5 4.16667H14.6583L7.05 11.775C6.725 12.1 6.725 12.625 7.05 12.95C7.375 13.275 7.9 13.275 8.225 12.95L15.8333 5.34167V7.5C15.8333 7.95833 16.2083 8.33333 16.6667 8.33333C17.125 8.33333 17.5 7.95833 17.5 7.5V2.5H12.5C12.0417 2.5 11.6667 2.875 11.6667 3.33333Z"
                fill="white"
            />
        </svg>
    );
}

function CopyIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12.917 16.6666H4.58366V5.83329C4.58366 5.37496 4.20866 4.99996 3.75033 4.99996C3.29199 4.99996 2.91699 5.37496 2.91699 5.83329V16.6666C2.91699 17.5833 3.66699 18.3333 4.58366 18.3333H12.917C13.3753 18.3333 13.7503 17.9583 13.7503 17.5C13.7503 17.0416 13.3753 16.6666 12.917 16.6666ZM17.0837 13.3333V3.33329C17.0837 2.41663 16.3337 1.66663 15.417 1.66663H7.91699C7.00033 1.66663 6.25033 2.41663 6.25033 3.33329V13.3333C6.25033 14.25 7.00033 15 7.91699 15H15.417C16.3337 15 17.0837 14.25 17.0837 13.3333ZM15.417 13.3333H7.91699V3.33329H15.417V13.3333Z"
                fill="white"
            />
        </svg>
    );
}

export default SuccessView;
