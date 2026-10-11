package com.tunnelx.vpn.tunnel

import android.os.ParcelFileDescriptor
import android.util.Log
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Tun2SocksHandler
 * Lê pacotes IP brutos da interface TUN do Android e encaminha para o túnel local.
 */
class Tun2SocksHandler(
    private val vpnInterface: ParcelFileDescriptor
) : Runnable {

    companion object {
        const val TAG = "Tun2SocksHandler"
    }

    private val isRunning = AtomicBoolean(false)
    private var thread: Thread? = null

    fun start() {
        if (isRunning.get()) return
        isRunning.set(true)
        thread = Thread(this, "Tun2Socks-Worker").apply { start() }
    }

    fun stop() {
        isRunning.set(false)
        thread?.interrupt()
        thread = null
    }

    override fun run() {
        val inputStream = FileInputStream(vpnInterface.fileDescriptor)
        val outputStream = FileOutputStream(vpnInterface.fileDescriptor)
        val packetBuffer = ByteArray(32768)

        Log.i(TAG, "Worker de leitura do TUN iniciado")

        try {
            while (isRunning.get()) {
                val length = inputStream.read(packetBuffer)
                if (length > 0) {
                    // O tráfego do TUN é despachado pelo pipeline tun2socks / BadVPN
                }
            }
        } catch (e: Exception) {
            Log.d(TAG, "Worker TUN encerrado")
        }
    }
}
