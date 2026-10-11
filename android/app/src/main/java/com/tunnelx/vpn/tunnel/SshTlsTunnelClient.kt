package com.tunnelx.vpn.tunnel

import android.util.Log
import com.jcraft.jsch.JSch
import com.jcraft.jsch.Session
import com.jcraft.jsch.SocketFactory
import java.io.InputStream
import java.io.OutputStream
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.Socket
import javax.net.ssl.SNIHostName
import javax.net.ssl.SSLParameters
import javax.net.ssl.SSLSocket
import javax.net.ssl.SSLSocketFactory

/**
 * SshTlsTunnelClient
 * Encapsula o handshake SSH dentro de uma camada TLS com injeção de SNI (Server Name Indication)
 * e abre um encaminhamento dinâmico SOCKS5 na porta local 1080.
 */
class SshTlsTunnelClient(
    private val remoteHost: String,
    private val remotePort: Int,
    private val sniHost: String,
    private val username: String,
    private val password: String,
    private val localSocksPort: Int = 1080
) {
    companion object {
        const val TAG = "SshTlsTunnelClient"
    }

    private var jschSession: Session? = null
    private var isConnected = false

    fun connect() {
        Log.i(TAG, "Iniciando túnel SSH-TLS para $remoteHost:$remotePort (SNI: $sniHost)")

        val jsch = JSch()
        val session = jsch.getSession(username, remoteHost, remotePort)
        session.setPassword(password)

        // Configuração de verificação de chave do host
        val config = java.util.Properties()
        config["StrictHostKeyChecking"] = "no"
        config["PreferredAuthentications"] = "password,keyboard-interactive"
        session.setConfig(config)

        // SocketFactory customizado que injeta o SNI via SSLSocket se for porta 443
        if (remotePort == 443 || remotePort == 8443) {
            session.setSocketFactory(object : SocketFactory {
                override fun createSocket(host: String?, port: Int): Socket {
                    val factory = SSLSocketFactory.getDefault() as SSLSocketFactory
                    val sslSocket = factory.createSocket() as SSLSocket

                    // Injeta SNI spoofing para bypass de operadora
                    val sslParams = SSLParameters()
                    sslParams.serverNames = listOf(SNIHostName(sniHost))
                    sslSocket.sslParameters = sslParams

                    sslSocket.connect(InetSocketAddress(remoteHost, remotePort), 10000)
                    sslSocket.startHandshake()
                    Log.i(TAG, "Handshake TLS com SNI '$sniHost' concluído com sucesso!")
                    return sslSocket
                }

                override fun getInputStream(socket: Socket?): InputStream {
                    return socket!!.getInputStream()
                }

                override fun getOutputStream(socket: Socket?): OutputStream {
                    return socket!!.getOutputStream()
                }
            })
        }

        // Conecta sessão SSH
        session.connect(15000)
        this.jschSession = session

        // Inicia encaminhamento de porta dinâmico SOCKS5 local na porta 1080
        val assignedPort = session.setPortForwardingD(localSocksPort)
        Log.i(TAG, "Túnel SOCKS5 dinâmico estabelecido na porta local: $assignedPort")

        this.isConnected = true
    }

    fun disconnect() {
        isConnected = false
        try {
            jschSession?.disconnect()
            jschSession = null
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao desconectar SSH-TLS", e)
        }
    }
}
