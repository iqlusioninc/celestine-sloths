import {
    CosmWasmClient,
    SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { WalletClient } from "@cosmos-kit/core";

export const SlothTransferInfo = {
    stargaze: {
        chainId: "elgafar-1",
        nftContract:
            "stars1z5vs00kvjwr3h050twnul5pd2sftk42ajy7xp6sg59gux4cvprvq08eryl",
        ICS721Contract:
            "stars1338rc4fn2r3k9z9x783pmtgcwcqmz5phaksurrznnu9dnu4dmctqr2gyzl",
        ICS721ChannelID: "channel-979",
        rpcUrl: "https://rpc.elgafar-1.stargaze-apis.com/",
    },
    lazy: {
        chainId: "lazynet-1",
        nftContract:
            "lazy1enc8mxs5tsu6zzmvu0uh9snj28yp4nt2xycv3l6054p339gweavqgd224r",
        ICS721Contract:
            "lazy1wug8sewp6cedgkmrmvhl3lf3tulagm9hnvy8p0rppz9yjw0g4wtq8xhtac",
        ICS721ChannelID: "channel-1",
        rpcUrl: "https://biggie.gjermund.tech:26657/",
    },
};

export async function queryNFTs(
    rpc: string,
    contractAddress: string,
    owner: string
) {
    const cosmwasmQuery = await CosmWasmClient.connect(rpc);

    const queryMsg = {
        tokens: { owner },
    };
    const response = await cosmwasmQuery.queryContractSmart(
        contractAddress,
        queryMsg
    );

    return response;
}

export async function getSlothNFTs(
    stargazeAddress: string,
    lazyAddress: string
) {
    queryNFTs(
        SlothTransferInfo.stargaze.rpcUrl,
        SlothTransferInfo.stargaze.nftContract,
        stargazeAddress
    );
    queryNFTs(
        SlothTransferInfo.lazy.rpcUrl,
        SlothTransferInfo.lazy.nftContract,
        lazyAddress
    );
}

export async function transferNFT({
    client,
    chainId,
    rpcUrl,
    nftContract,
    ICS721ChannelID,
    ICS721Contract,
    tokenId,
    sender,
    receiver,
}: {
    client: WalletClient | undefined;
    chainId: string;
    rpcUrl: string;
    nftContract: string;
    ICS721Contract: string;
    ICS721ChannelID: string;
    tokenId: string;
    sender: string;
    receiver: string;
}) {
    if (!sender || !client?.getOfflineSigner) {
        return;
    }

    const signer = await client?.getOfflineSigner(chainId);

    const signingCosmwasmClient = await SigningCosmWasmClient.connectWithSigner(
        rpcUrl,
        // @ts-ignore
        signer
    );
    const timeoutTimestamp = Math.floor(Date.now() / 1000) + 60 * 5;

    const timeoutTimestampNanoseconds = timeoutTimestamp
        ? BigInt(timeoutTimestamp) * BigInt(1_000_000_000)
        : BigInt(0);

    const msg = {
        send_nft: {
            contract: ICS721Contract,
            token_id: tokenId,
            msg: btoa(
                JSON.stringify(
                    {
                        receiver: receiver,
                        channel_id: ICS721ChannelID,
                        timeout: {
                            timestamp: timeoutTimestampNanoseconds,
                        },
                    },
                    (key, value) => {
                        if (typeof value === "bigint") {
                            return value.toString();
                        }
                        return value;
                    }
                )
            ),
        },
    };

    const fee = {
        amount: [
            {
                amount: "25000",
                denom: "ibc/C3E53D20BC7A4CC993B17C7971F8ECD06A433C10B6A96F4C4C3714F0624C56DA",
            },
        ],
        gas: "1000000",
    };

    return signingCosmwasmClient.execute(sender, nftContract, msg, fee);
}
