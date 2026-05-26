import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { API_URL } from '@/lib/config'
let socket: Socket | null = null

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!socket) {
      socket = io(API_URL, { transports: ['websocket'] })
    }
    socketRef.current = socket
    return () => {}
  }, [])

  return socketRef.current
}