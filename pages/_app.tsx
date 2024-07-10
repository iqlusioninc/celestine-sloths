import "@leapwallet/cosmos-social-login-capsule-provider-ui/styles.css";
import "../styles/globals.css";
import "@leapwallet/embedded-wallet-sdk-react/styles.css";
import type { AppProps } from "next/app";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { chains, assets } from "chain-registry";
import "@interchain-ui/react/styles";
import { ApolloProvider as GraphqlProvider } from "@apollo/client";
import { LeapCapsuleWallet } from "@cosmos-kit/leap-capsule-social-login";

import { client } from "../config/apolloclient";
import LeapUiTheme, { ThemeName } from "../components/ThemeProvider";
import Head from "next/head";
import { SignerOptions, Wallet } from "@cosmos-kit/core";
import ConnectWalletSideCurtain from "../components/ConnectWalletSideCurtain/connectWalletSideCurtain";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "@leapwallet/elements/styles.css";
import { OAuthMethod } from "@leapwallet/cosmos-social-login-capsule-provider";
import { createPublicClient } from "viem";
import { mainnet } from "wagmi/chains";
import { createConfig, WagmiConfig } from "wagmi";
import { http } from "viem";
import { Layout } from "../components/Layout";

if (typeof global.self === "undefined") {
  (global as any).self = global;
}

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});

const updatedChains = chains.map((chain) => {
  if (chain.chain_id === "stargaze-1") {
    return {
      ...chain,
      apis: {
        ...chain.apis,
        rest: [
          {
            address: process.env.NEXT_PUBLIC_NODE_REST_ENDPOINT || "https://rest.stargaze-apis.com/",
          },
        ].concat(chain.apis?.rest ?? []),
        rpc: [
          {
            address: process.env.NEXT_PUBLIC_NODE_REST_ENDPOINT || "https://rpc.stargaze-apis.com/",
          },
        ].concat(chain.apis?.rpc ?? []),
      },
    };
  }

  return chain;
});

function CreateCosmosApp({ Component, pageProps }: AppProps) {
  const signerOptions: SignerOptions = {
    // signingStargate: () => {
    //   return getSigningCosmosClientOptions();
    // }
  };

  const [cosmosCapsuleWallet, setCosmosCapsuleWallet] = useState<LeapCapsuleWallet>();
  const [wallets, setWallets] = useState();

  useEffect(() => {
    const fn = async () => {
      if (!cosmosCapsuleWallet) {
        const WalletClass = await import("@cosmos-kit/leap-capsule-social-login").then((m) => m.LeapCapsuleWallet);
        const WalletInfo: Wallet = await import("../leap-social-login/registry").then((m) => m.LeapCapsuleInfo);
        const cosmosCapsuleWallet = new WalletClass(WalletInfo);
        setCosmosCapsuleWallet(cosmosCapsuleWallet);
        // @ts-ignore: Disabling typecheck until we figureout proper way of adding cosmoscapsulewallet in cosmos-kit
        setWallets([cosmosCapsuleWallet, ...keplrWallets, ...leapWallets]);
      }
    };

    fn();
  });

  if (!cosmosCapsuleWallet) {
    return <>Loading</>;
  }

  return (
    <>
      <Head>
        <title>Celestine Sloths Society Shop</title>
      </Head>

      <WagmiConfig config={config}>
        <GraphqlProvider client={client}>
          <LeapUiTheme defaultTheme={ThemeName.DARK}>
            <ChainProvider
              chains={updatedChains}
              assetLists={assets}
              //@ts-ignore
              walletModal={ConnectWalletSideCurtain}
              //@ts-ignore
              wallets={wallets}
              walletConnectOptions={{
                signClient: {
                  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "",
                  relayUrl: "wss://relay.walletconnect.org",
                  metadata: {
                    name: "Celestine Sloths Society Shop",
                    description: "Celestine Sloths Society Shop",
                    url: "https://www.celestineslothsociety.com",
                    icons: [""],
                  },
                },
              }}
              signerOptions={signerOptions}>
              <Layout>
                <Component {...pageProps} />
                {!!cosmosCapsuleWallet && <CustomCapsuleModalViewX />}
              </Layout>
            </ChainProvider>
          </LeapUiTheme>
          p0
        </GraphqlProvider>
      </WagmiConfig>
    </>
  );
}

export default CreateCosmosApp;

const CCUI = dynamic(
  () => import("@leapwallet/cosmos-social-login-capsule-provider-ui").then((m) => m.CustomCapsuleModalView),
  { ssr: false }
);

const TransactionSigningModal = dynamic(
  () => import("@leapwallet/cosmos-social-login-capsule-provider-ui").then((m) => m.TransactionSigningModal),
  { ssr: false }
);

export function CustomCapsuleModalViewX() {
  const [showCapsuleModal, setShowCapsuleModal] = useState(false);

  return (
    <div className="leap-ui dark z-[9999] fixed">
      <CCUI
        showCapsuleModal={showCapsuleModal}
        setShowCapsuleModal={setShowCapsuleModal}
        theme={"dark"}
        onAfterLoginSuccessful={() => {
          window.successFromCapsuleModal();
        }}
        onLoginFailure={() => {
          window.failureFromCapsuleModal();
        }}
        oAuthMethods={[OAuthMethod.GOOGLE, OAuthMethod.APPLE, OAuthMethod.TWITTER, OAuthMethod.DISCORD]}
      />
      <TransactionSigningModal dAppInfo={{ name: "Celestine Sloths" }} />
    </div>
  );
}
