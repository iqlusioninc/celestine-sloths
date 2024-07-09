export const signWithKeplr = async (
  ethAddress: string,
  starsAddress: string
) => {
  if (!window.keplr) {
    throw new Error("Please install Keplr extension")
  }

  const chainId = "stargaze"
  await window.keplr.enable(chainId)

  // @ts-ignore
  if (typeof window.getOfflineSigner !== "function") {
    throw new Error(
        "Keplr extension is not installed or not available in this context."
    )
  }

  // @ts-ignore
  const signer = window.getOfflineSigner(chainId)
  const accounts = await signer.getAccounts()

  if (accounts[0].address !== starsAddress) {
    throw new Error(
      "Keplr account does not match the provided Stargaze address"
    )
  }

  const messageContent = {
    ethAddress: ethAddress,
    starsAddress: starsAddress,
  }

  // Serialize the message content to a string for signing
  const message = JSON.stringify(messageContent)

  // Sign the message
  const { signature } = await window.keplr.signArbitrary(
    chainId,
    accounts[0].address,
    message
  )

  // Obtain the public key in Base64 format
  const pubKey = Buffer.from(accounts[0].pubkey).toString("base64")

  const dataString = Buffer.from(
    JSON.stringify(messageContent)
  ).toString("base64")

  return {
    messageContent, // Including the original message content for clarity
    signature: signature,
    pubKey: pubKey,
    data: dataString, // Add this line
  }
}
