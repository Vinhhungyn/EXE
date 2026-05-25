import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:3001', { transports: ['websocket'] })
    }
    socketRef.current = socket
    return () => {}
  }, [])

  return socketRef.current
}