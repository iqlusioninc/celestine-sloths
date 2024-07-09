// Correct import statement for NextApiRequest and NextApiResponse
import { NextApiRequest, NextApiResponse } from "next"
import { kv } from "@vercel/kv"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed")
  }

  const { ethAddress, starsAddress } = req.body

  const existingSommRegistration = await kv.get(`stars:${starsAddress}`)
  const existingEthRegistration = await kv.get(`eth:${ethAddress}`)

  let message = ""
  if (existingSommRegistration && existingEthRegistration) {
    message = `Both your ETH address ${ethAddress} and Stargaze address ${starsAddress} are already registered.`
  } else if (existingEthRegistration) {
    message = `The ETH address ${ethAddress} is already registered.`
  } else if (existingSommRegistration) {
    message = `The Stargaze address ${starsAddress} is already registered.`
  }

  if (message) {
    return res.status(409).json({ message })
  }

  return res
    .status(200)
    .json({ message: "Addresses are not registered." })
}
