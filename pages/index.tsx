import { Toaster } from "react-hot-toast";
import { NFTs } from "../components/NFTList";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { isValidAddressWithPrefix } from "../config/validateAddress";

export default function Home() {
  const [collection, setCollection] = useState<string | undefined>();
  const router = useRouter();

  const [isElementsModalOpen, setIsElementsModalOpen] =
    useState<boolean>(false);


  useEffect(() => {
    if (typeof router.query.collectionAddress === "string") {
      if (isValidAddressWithPrefix(router.query.collectionAddress, "stars")) {
        setCollection(router.query.collectionAddress);
      }
    }
  }, [router.query]);

  return (
    <>
      <div>
        <div className="px-10 sm:px-14 justify-center align-middle items-center self-center origin-center">
          <NFTs
            setIsElementsModalOpen={setIsElementsModalOpen}
            collection={collection}
          />
          <Toaster position="bottom-right" />
        </div>
      </div>
    </>
  );
}
