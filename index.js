const express = require("express")
const app = express()
const cors = require("cors")
const socket = require("socket.io")
require("dotenv").config()
const { addUser, removeUser, getAllUsersInTheRoom } = require("./functions")

app.use(cors({ origin: process.env.CLIENT_APP }))

const server = app.listen(4000)

const io = socket(server, {
  cors: {
    origin: process.env.CLIENT_APP,
    methods: ["GET", "POST"],
  },
})

io.on("connection", socket => {
  console.log("New user connected")
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
