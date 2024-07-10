import { motion } from "framer-motion";
import { useSendNFT } from "../../../context/SendNFT";
import { FaChevronDown } from "react-icons/fa6";

export default function NFTSelectButton() {
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
