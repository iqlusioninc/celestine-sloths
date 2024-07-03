import { SwapsModal, WalletClientContextProvider } from "@leapwallet/elements";

import { useChain } from "@cosmos-kit/react";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useElementsWalletClient } from "../config/walletclient";

export const renderLiquidityButton = ({ onClick }: any) => {
  return <button onClick={onClick} id="open-liquidity-modal-btn"></button>;
};

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export function ElementsContainer({ isOpen, setIsOpen }: Props) {
  const { address, openView } = useChain("stargazetestnet");
  const walletClient = useElementsWalletClient();
  useEffect(() => {
    const elementsModal = document.querySelector(".leap-ui");
    if (elementsModal) {
      //@ts-ignore
      elementsModal.style["zIndex"] = 11;
    }
  }, []);
  return (
    <div className="fixed z-99 leap-ui dark">
      <WalletClientContextProvider
        value={{
          userAddress: address,
          walletClient: walletClient,
          connectWallet: async () => {
            openView();
          },
        }}
      >
        <SwapsModal
          isOpen={isOpen}
          title="Get STARS"
          setIsOpen={setIsOpen}
          className="max-w-[95vw]"
          defaultValues={{
            destinationChainId: "stargaze-1",
            destinationAsset: "ustars",
          }}
        />
      </WalletClientContextProvider>
    </div>
  );
}
