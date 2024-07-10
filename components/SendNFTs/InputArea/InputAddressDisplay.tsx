import { FaCircleUser, FaCircleXmark } from "react-icons/fa6";
import { sliceAddress } from "../../../config/formatAddress";
import { motion } from "framer-motion";
import { useSendNFT } from "../../../context/SendNFT";

export default function InputAddressDisplay() {
    const { setToAddress, toAddress, setInputStateActive } = useSendNFT();

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
