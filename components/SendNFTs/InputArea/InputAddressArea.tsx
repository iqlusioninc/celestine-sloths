import { motion } from "framer-motion";
import { useSendNFT } from "../../../context/SendNFT";
import { useEffect } from "react";
import React from "react";

export default function InputAddressArea({
    setInputStateActive,
}: {
    setInputStateActive: (active: boolean) => void;
}) {
    const { setToAddress, toAddress } = useSendNFT();
    const { chainWallet, openView } = useChain("stargazetestnet");
    const client = chainWallet?.client;
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
            className="flex group flex-row justify-between w-full items-center p-4 h-[60px] gap-2"
        >
            <input
                className="font-bold flex-1 text-lg text-card-foreground placeholder:text-muted-foreground bg-card outline-none"
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
                        if (!client) {
                            openView();
                        }
                        if (client.getAccount) {
                            throw new Error("Account not found");
                        }
                        const account = await client.getAccount("lazynet-1");
                        if (account?.address) {
                            setToAddress(account.address);
                        }
                    } catch {
                        //
                    }
                }}
            >
                Autofill
            </button>
        </motion.div>
    );
}
