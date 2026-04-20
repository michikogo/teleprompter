import "dotenv/config"
import express from "express"
import { createServer } from "http"
import { WebSocketServer, WebSocket } from "ws"

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

const PORT = 3001
const DEEPGRAM_URL =
  "wss://api.deepgram.com/v1/listen" +
  "?model=nova-3" +
  "&language=en-US" +
  "&encoding=linear16" +
  "&sample_rate=16000" +
  "&punctuate=true"

wss.on("connection", (clientWs) => {
  const apiKey = process.env.DEEPGRAM_API_KEY
  if (!apiKey) {
    clientWs.close(1011, "DEEPGRAM_API_KEY not set")
    return
  }

  const deepgramWs = new WebSocket(DEEPGRAM_URL, {
    headers: { Authorization: `Token ${apiKey}` },
  })

  deepgramWs.on("open", () => {
    clientWs.on("message", (data) => {
      if (deepgramWs.readyState === WebSocket.OPEN) {
        deepgramWs.send(data)
      }
    })
  })

  // Forward Deepgram transcripts to the client
  deepgramWs.on("message", (data) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data)
    }
  })

  const cleanup = () => {
    if (deepgramWs.readyState === WebSocket.OPEN) deepgramWs.close()
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close()
  }

  clientWs.on("close", cleanup)
  clientWs.on("error", cleanup)
  deepgramWs.on("close", cleanup)
  deepgramWs.on("error", (err) => {
    console.error("Deepgram WS error:", err.message)
    cleanup()
  })
})

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
