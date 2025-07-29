import { useState, useEffect } from 'react'
import { socket, connectSocket, disconnectSocket } from '../utils/socket'

export default function StreamingTime() {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Connect to Socket.IO server
    connectSocket()

    // Socket event handlers
    const handleConnect = () => {
      setIsConnected(true)
      setError('')
      // Start the time stream
      socket.emit('start-time-stream')
    }

    const handleDisconnect = () => {
      setIsConnected(false)
      setCurrentTime('')
    }

    const handleTimeUpdate = (data: { timestamp: string; formatted: string }) => {
      setCurrentTime(data.formatted)
    }

    const handleConnectError = (error: Error) => {
      setError(error.message || 'Failed to connect to server')
      setIsConnected(false)
    }

    // Register event listeners
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('time-update', handleTimeUpdate)
    socket.on('connect_error', handleConnectError)

    // Cleanup function
    return () => {
      // Stop the time stream
      socket.emit('stop-time-stream')
      
      // Remove event listeners
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('time-update', handleTimeUpdate)
      socket.off('connect_error', handleConnectError)
      
      // Disconnect socket
      disconnectSocket()
    }
  }, [])

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Live Server Time</h2>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {error && (
          <div className="text-red-600 text-sm">
            Error: {error}
          </div>
        )}
        
        <div className="text-2xl font-mono">
          {currentTime || 'Waiting for time...'}
        </div>
      </div>
    </div>
  )
}
