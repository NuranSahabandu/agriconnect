const mongoose = require('mongoose')

let isConnected = false

// Event listeners for connection state
mongoose.connection.on('connected', () => {
  isConnected = true
  console.log(`✅ [MongoDB Atlas] Mongoose active connection: ${mongoose.connection.name}`)
})

mongoose.connection.on('error', (err) => {
  console.error('❌ [MongoDB Atlas] Connection Error:', err.message)
})

mongoose.connection.on('disconnected', () => {
  isConnected = false
  console.warn('⚠️ [MongoDB Atlas] Connection disconnected')
})

async function connectDB() {
  const uri = process.env.MONGO_URI

  if (!uri) {
    console.warn('⚠️ [MongoDB Atlas] Warning: MONGO_URI is not set in server/.env')
    return false
  }

  try {
    const dbName = process.env.MONGO_DB_NAME || 'agriconnect'
    const conn = await mongoose.connect(uri, { dbName })
    isConnected = true
    console.log(`✅ [MongoDB Atlas] Connected successfully to host: ${conn.connection.host} (Database: ${conn.connection.name})`)
    return true
  } catch (error) {
    console.error('❌ [MongoDB Atlas] Connection Error:', error.message)
    console.warn('⚠️ [MongoDB Atlas] Please verify network access (0.0.0.0/0 whitelist in Atlas) and database credentials.')
    isConnected = false
    return false
  }
}

function getIsConnected() {
  return mongoose.connection.readyState === 1
}

module.exports = { connectDB, getIsConnected }

