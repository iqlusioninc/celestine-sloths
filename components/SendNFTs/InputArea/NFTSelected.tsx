import { motion } from "framer-motion";
import Image from "next/image";
import { FaCircleXmark } from "react-icons/fa6";
import { useSendNFT } from "../../../context/SendNFT";

export default function NFTSelected() {
    const { setSelectedNFT, selectedNFT } = useSendNFT();

    const collection = selectedNFT?.collection?.name;
    const url = selectedNFT?.media?.visualAssets?.lg?.url;
    const id = selectedNFT.tokenId;

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
                    className="rounded-sm overflow-hidden"
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
