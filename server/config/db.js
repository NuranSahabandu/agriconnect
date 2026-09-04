const mongoose = require('mongoose')

let isConnected = false

async function connectDB() {
  const uri = process.env.MONGO_URI

  if (!uri) {
    console.warn('⚠️ [MongoDB Atlas] Warning: MONGO_URI is not set in server/.env')
    return false
  }

  try {
    const conn = await mongoose.connect(uri)
    isConnected = true
    console.log(`✅ [MongoDB Atlas] Connected successfully to host: ${conn.connection.host} (DB: ${conn.connection.name})`)
    return true
  } catch (error) {
    console.error('❌ [MongoDB Atlas] Connection Error:', error.message)
    console.warn('⚠️ [MongoDB Atlas] Running in fallback mode. Please check your Atlas credentials and IP whitelist in MongoDB Atlas dashboard (allow access from anywhere 0.0.0.0/0).')
    isConnected = false
    return false
  }
}

function getIsConnected() {
  return isConnected && mongoose.connection.readyState === 1
}

module.exports = { connectDB, getIsConnected }
