import Image from "next/image";
import { FaBars, FaXTwitter } from "react-icons/fa6";
import { MdOutlineClose } from "react-icons/md";
import CelestineSlothsSociety from "../public/celestine-sloths-society.png";
import { useChain } from "@cosmos-kit/react-lite";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { WalletButton } from "../components/WalletButton";
import Text from "./Text";
import { useRouter } from 'next/router';
import StargazeLogo from "../public/stargaze-logo.svg";

export const ElementsContainerDynamic = dynamic(
  () =>
    import("../components/ElementsContainer").then(
      (mod) => mod.ElementsContainer
    ),
  { ssr: false }
);

const fetchBalance = async (address: string, chain: any) => {
  const res = await fetch(
    `${chain.apis?.rest?.[0].address}/cosmos/bank/v1beta1/balances/${address}`
  );
  const response = await res.json();
  const starsBalance = response.balances.find(
    (balance: any) => balance.denom === "ustars"
  );
  return starsBalance?.amount ?? "0";
};

export function Header({
  openEmbeddedWalletModal,
  setIsElementsModalOpen,
}: {
  openEmbeddedWalletModal: Function;
  setIsElementsModalOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const { address, chain } = useChain("stargaze");

  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (address) {
      fetchBalance(address, chain).then(setBalance);
    }
  }, [address]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <section className="flex flex-wrap gap-x-3 gap-y-3 fixed backdrop-blur-md bg-[#212121DE] items-center justify-between px-10 py-4 top-0 left-0 right-0 z-10">
      <Image
        src={CelestineSlothsSociety}
        alt="celestine-sloths"
        className="flex w-[70%] sm:w-[20%] cursor-pointer"
        onClick={() => {
          router.push('/');
        }}
      />

      <button className="sm:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {!isMenuOpen ? (
          <FaBars color="#FFF" size={16} />
        ) : (
          <MdOutlineClose color="#FFF" size={16} />
        )}
      </button>

      <div id="nav-menu" className={`md:block ${isMenuOpen ? "" : "hidden"}`}>
        <div className="flex flex-row gap-3 flex-wrap">
          <button
            onClick={() => {
              router.push('/snapshot');
            }}
            className="flex gap-2 items-center h-10 justify-between border border-white-100 rounded-3xl px-5 py-2"
          >
            <Text size="sm" color="text-white-100 font-bold">
              Snapshot
            </Text>
          </button>

          <button
            onClick={() =>
              window.open("https://twitter.com/CelestineSloths", "_blank")
            }
            className="flex flex-row gap-2 h-10 items-center justify-between border border-white-100 rounded-3xl px-5 py-2"
          >
            <FaXTwitter color="#FFF" size={16} />
            <Text size="sm" color="text-white-100 font-bold">
              Follow
            </Text>
          </button>

          <button
            onClick={() => {
              setIsElementsModalOpen(true);
            }}
            className="flex gap-2 items-center h-10 justify-between border border-white-100 rounded-3xl px-5 py-2"
          >
            <Image src={StargazeLogo} height={16} width={16} alt="get stars" />
            <Text size="sm" color="text-white-100 font-bold">
              Get STARS
            </Text>
          </button>

          <WalletButton
            balance={balance || null}
            openEmbeddedWalletModal={openEmbeddedWalletModal}
          />
        </div>
      </div>
    </section>
  );
}
