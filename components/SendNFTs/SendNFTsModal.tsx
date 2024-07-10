import {
    Dialog,
    DialogContent,
    Drawer,
    DrawerContent,
} from "@leapwallet/react-ui";
import { AnimatePresence, motion } from "framer-motion";
import { FaArrowLeft, FaXmark } from "react-icons/fa6";
import { SendNFTProvider, useSendNFT } from "../../context/SendNFT";
import { useIsMobileView } from "../../hooks/useIsMobileView";
import InputView from "./InputView";

type SendNFTsModalProps = {
    isSendNFTsModalOpen: boolean;
    setIsSendNFTsModalOpen: (value: boolean) => void;
};

const SendNFTsModal = ({
    isSendNFTsModalOpen,
    setIsSendNFTsModalOpen,
}: SendNFTsModalProps) => {
    const { isMobile } = useIsMobileView();
    if (isMobile) {
        return (
            <Drawer
                open={isSendNFTsModalOpen}
                onOpenChange={setIsSendNFTsModalOpen}
            >
                <DrawerContent className="p-0 w-full h-[80%] rounded-t-3xl border cursor-default flex flex-col justify-start items-center overflow-hidden">
                    <SendNFTProvider>
                        <AnimatePresence mode="popLayout">
                            <SendNFTs
                                setIsSendNFTsModalOpen={setIsSendNFTsModalOpen}
                            />
                        </AnimatePresence>
                    </SendNFTProvider>
                </DrawerContent>
            </Drawer>
        );
    }
    return (
        <Dialog
            open={isSendNFTsModalOpen}
            onOpenChange={setIsSendNFTsModalOpen}
        >
            <DialogContent
                showClose={false}
                className="p-0 w-[400px] h-[556px] rounded-3xl border cursor-default flex flex-col justify-start items-start overflow-hidden"
            >
                <SendNFTProvider>
                    <AnimatePresence mode="popLayout">
                        <SendNFTs
                            setIsSendNFTsModalOpen={setIsSendNFTsModalOpen}
                        />
                    </AnimatePresence>
                </SendNFTProvider>
            </DialogContent>
        </Dialog>
    );
};

const SendNFTs = ({
    setIsSendNFTsModalOpen,
}: {
    setIsSendNFTsModalOpen: (value: boolean) => void;
}) => {
    const { step, setStep, userNFTs, onNFTSelect } = useSendNFT();

    if (step === 1) {
        return (
            <motion.div
                key={1}
                className="w-full h-full"
                transition={{
                    duration: 0.2,
                    stiffness: 80,
                }}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
            >
                <div className="pt-6 px-6 flex flex-col justify-start items-start gap-6 w-full h-full">
                    <div className="flex flex-row justify-between items-center w-full gap-4">
                        <div className="flex flex-row justify-start items-center gap-2">
                            <button
                                onClick={() => {
                                    setStep(0);
                                }}
                                className="rounded-full p-2 bg-card hover:bg-muted"
                            >
                                <FaArrowLeft />
                            </button>
                            <div className="text-md font-bold !leading-[21.6px] text-foreground">
                                Select NFTs
                            </div>
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

                    <div className="flex flex-col justify-start gap-5 items-start w-full flex-1 overflow-y-scroll pb-8">
                        {userNFTs?.map((nft: any) => (
                            <NFTCard key={nft.id} nft={nft} />
                        ))}
                    </div>
                </div>
                {userNFTs && userNFTs?.length >= 6 && (
                    <div
                        className="w-full h-[50px] absolute z-[2] bottom-0"
                        style={{
                            background: `linear-gradient(0deg, rgba(20,20,20,1) 0%, rgba(20,20,20,0.5) 60%, rgba(20,20,20,0) 100%)`,
                        }}
                    ></div>
                )}
            </motion.div>
        );
    }

    return <InputView setIsSendNFTsModalOpen={setIsSendNFTsModalOpen} />;
};

function NFTCard({ nft }: { nft: any }) {
    const collection = nft?.collection?.name;
    const url = nft?.media?.visualAssets?.lg?.url;
    const id = nft.tokenId;

    const { onNFTSelect } = useSendNFT();

    return (
        <div
            className="flex flex-row gap-3 cursor-pointer h-max w-full"
            onClick={() => {
                console.log(nft);
                onNFTSelect(nft);
            }}
        >
            <img
                src={url}
                alt=""
                className="rounded-lg !w-[48px] !h-[48px] shadow-sm"
            />
            <div className="flex flex-col justify-start items-start flex-1 gap-[6px]">
                <div className="w-full whitespace-nowrap font-bold text-sm text-foreground !leading-[19.6px] overflow-hidden text-ellipsis">
                    {collection}
                </div>
                <div className="flex flex-row justify-start items-center gap-1 w-full overflow-scroll">
                    <div className="bg-card flex flex-row gap-1 justify-start items-center p-[6px] rounded-full">
                        <img
                            src="https://assets.leapwallet.io/stars.png"
                            alt="Stargaze"
                            className="h-4 w-4 rounded-full"
                        />
                        <div className="text-card-foreground text-xs font-medium !leading-[16px]">
                            Stargaze
                        </div>
                    </div>
                    <div className="bg-card flex flex-row gap-1 justify-start items-center p-[6px] rounded-full">
                        <div className="text-muted-foreground text-xs font-medium !leading-[16px]">
                            #{id}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SendNFTsModal;
