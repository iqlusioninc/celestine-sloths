import { ChainWalletBase, WalletClient } from "@cosmos-kit/core";

export const signWithCosmosWallet = async (
    chainWallet: ChainWalletBase | undefined,
    ethAddress: string,
    starsAddress: string
) => {
    const client = chainWallet?.client as WalletClient;
    if (!chainWallet || !client) {
        throw new Error(
            `Please install/connect a ${
                chainWallet?.walletPrettyName ?? "Cosmos"
            } Wallet`
        );
    }

    const chainId = "stargaze-1";
    if (client.enable) {
        await client.enable(chainId);
    }

    if (typeof client.getOfflineSigner !== "function") {
        throw new Error(
            `${
                chainWallet?.walletPrettyName ?? "Cosmos"
            } wallet is not installed or not available in this context.`
        );
    }

    const signer = await client.getOfflineSigner(chainId);
    const accounts = await signer.getAccounts();

    if (accounts[0].address !== starsAddress) {
        throw new Error(
            `${
                chainWallet?.walletPrettyName ?? "Cosmos"
            } account does not match the provided Stargaze address`
        );
    }

    const messageContent = {
        ethAddress: ethAddress,
        starsAddress: starsAddress,
    };

    // Serialize the message content to a string for signing
    const message = JSON.stringify(messageContent);

    if (!client.signArbitrary) {
        throw new Error(
            `${
                chainWallet?.walletPrettyName ?? "Cosmos"
            } Wallet does not support signing arbitrary messages`
        );
    }

    // Sign the message
    const { signature } = await client.signArbitrary(
        chainId,
        accounts[0].address,
        message
    );

    // Obtain the public key in Base64 format
    const pubKey = Buffer.from(accounts[0].pubkey).toString("base64");

    const dataString = Buffer.from(JSON.stringify(messageContent)).toString(
        "base64"
    );

    return {
        messageContent, // Including the original message content for clarity
        signature: signature,
        pubKey: pubKey,
        data: dataString, // Add this line
    };
};
