let users = []
let username = null
const addUser = ({ username, roomId, userId, photoUrl }) => {
  const user = { username, roomId, userId, photoUrl }
  users.push(user)
  console.log(users)
  return user
}

const removeUser = ({ roomId, userId }) => {
  const index = users.findIndex(
    user => user.userId === userId && user.roomId === roomId
  )
  users.splice(index, 1)
  console.log("remove", users)
  return userId
}

const getAllUsersInTheRoom = roomId => {
  const allUsersInRoom = users.filter(user => user.roomId === roomId)
  return allUsersInRoom
}

const renameUser = ({ username, userId }) => {
  const index = users.findIndex(user => user.userId === userId)
  users[index].username = username
}

module.exports = {
  addUser,
  removeUser,
  getAllUsersInTheRoom,
  renameUser,
}
