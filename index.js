require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const socket = require("socket.io")
const { addUser, removeUser, getAllUsersInTheRoom } = require("./functions")

app.get("/", (req, res) => {
  res.send("Hello World")
})

app.use(cors({ origin: process.env.CLIENT_APP }))

// !important use code below for loacl dev if the peer server is down or not working ⬇️
// const { PeerServer } = require("peer")
// const peerServer = PeerServer({ port: 2000, path: "/", key: "peerjs" })

const server = app.listen(process.env.PORT || 4000)

const io = socket(server, {
  cors: {
    origin: process.env.CLIENT_APP,
    methods: ["GET", "POST"],
  },
})

io.on("connection", socket => {
  let userToRemove = null

  socket.on("getAllUsersForTheNewPage", roomId => {
    socket.emit("get-All-Users", getAllUsersInTheRoom(roomId))
  })
  socket.on("join-room", ({ username, roomId, userId, photoUrl }) => {
    socket.join(roomId)
    addUser({ username, roomId, userId, photoUrl })
    io.to(roomId).emit("get-All-Users", getAllUsersInTheRoom(roomId))
    socket.broadcast.to(roomId).emit("user-joined", userId)
    socket.on("send-message", (message, roomId) => {
      io.to(roomId).emit("receive-message", message, username)
      socket.broadcast.to(roomId).emit("notify", message, username)
    })
    socket.on("end-call", (userId, roomId) => {
      userToRemove = { userId, roomId }
    })

    socket.on("disconnect", () => {
      const removeUserId = removeUser({
        roomId: userToRemove?.roomId,
        userId: userToRemove?.userId,
      })
      socket.broadcast
        .to(roomId)
        .emit("user-left", getAllUsersInTheRoom(roomId), removeUserId)
    })
  })
})
