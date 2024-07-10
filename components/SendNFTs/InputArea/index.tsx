import { AnimatePresence, motion } from "framer-motion";
import { useSendNFT } from "../../../context/SendNFT";
import InputAddressArea from "./InputAddressArea";
import NFTSelected from "./NFTSelected";
import InputAddressDisplay from "./InputAddressDisplay";
import NFTSelectButton from "./NFTSelectButton";

export default function InputArea() {
    const { selectedNFT, inputStateActive, setInputStateActive, error } =
        useSendNFT();

    return (
        <motion.div
            key={"input-area"}
            transition={{
                duration: 0.2,
                stiffness: 80,
            }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex flex-col justify-start items-start gap-4 w-full h-full"
        >
            <div className="w-full flex flex-col justify-start items-start rounded-xl bg-card">
                <div className="pl-4 pr-3 py-3 text-sm font-medium text-card-foreground">
                    You’re sending
                </div>
                <div className="h-[1px] w-full bg-muted"></div>
                <AnimatePresence mode="popLayout" initial={false}>
                    {selectedNFT ? <NFTSelected /> : <NFTSelectButton />}
                </AnimatePresence>
            </div>
            <div className="w-full flex flex-col justify-start items-start rounded-xl bg-card">
                <div className="pl-4 pr-3 py-3 text-sm font-medium text-card-foreground">
                    To
                </div>
                <div className="h-[1px] w-full bg-muted"></div>
                <AnimatePresence mode="popLayout" initial={false}>
                    {inputStateActive ? (
                        <InputAddressArea />
                    ) : (
                        <InputAddressDisplay />
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
                {error && (
                    <motion.div
                        key={"error"}
                        transition={{
                            duration: 0.2,
                            stiffness: 80,
                        }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="text-destructive bg-opacity-20 px-4 w-full text-left font-bold text-md"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
