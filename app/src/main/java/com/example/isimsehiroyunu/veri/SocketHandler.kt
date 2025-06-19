package com.example.isimsehiroyunu.veri

import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException

object SocketHandler {
    private lateinit var mSocket: Socket

    fun setSocket(serverUrl: String) {
        try {
            mSocket = IO.socket(serverUrl)
        } catch (e: URISyntaxException) {
            throw RuntimeException(e)
        }
    }

    fun getSocket(): Socket = mSocket

    fun establishConnection() {
        mSocket.connect()
    }

    fun closeConnection() {
        mSocket.disconnect()
    }
}
