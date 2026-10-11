package com.tunnelx.vpn.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.core.app.NotificationCompat
import com.tunnelx.vpn.MainActivity
import com.tunnelx.vpn.R
import com.tunnelx.vpn.tunnel.SshTlsTunnelClient
import com.tunnelx.vpn.tunnel.Tun2SocksHandler
import java.util.concurrent.atomic.AtomicBoolean

/**
 * TunnelVpnService - Serviço VpnService nativo Android
 * Configura interface TUN (tun0), intercepta todo tráfego de rede e
 * despacha via cliente SSH-TLS com injeção de SNI e tun2socks.
 */
class TunnelVpnService : VpnService() {

    companion object {
        const val TAG = "TunnelVpnService"
        const val ACTION_CONNECT = "com.tunnelx.vpn.CONNECT"
        const val ACTION_DISCONNECT = "com.tunnelx.vpn.DISCONNECT"
        const val ACTION_STATUS_UPDATE = "com.tunnelx.vpn.STATUS_UPDATE"

        const val CHANNEL_ID = "tunnelx_vpn_service_channel"
        const val NOTIFICATION_ID = 2001

        var isRunning = AtomicBoolean(false)
        var totalBytesIn = 0L
        var totalBytesOut = 0L
    }

    private var vpnInterface: ParcelFileDescriptor? = null
    private var tunnelClient: SshTlsTunnelClient? = null
    private var tun2SocksHandler: Tun2SocksHandler? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: return START_NOT_STICKY

        if (action == ACTION_CONNECT) {
            val host = intent.getStringExtra("EXTRA_HOST") ?: "144.91.72.243"
            val port = intent.getIntExtra("EXTRA_PORT", 443)
            val sni = intent.getStringExtra("EXTRA_SNI") ?: "unitelmoney.com"
            val user = intent.getStringExtra("EXTRA_USER") ?: "tunnelx"
            val pass = intent.getStringExtra("EXTRA_PASS") ?: "tunnelx123"

            startTunnel(host, port, sni, user, pass)
        } else if (action == ACTION_DISCONNECT) {
            stopTunnel()
        }

        return START_STICKY
    }

    private fun startTunnel(host: String, port: Int, sni: String, user: String, pass: String) {
        if (isRunning.get()) return
        isRunning.set(true)

        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification("Conectando ao túnel SSH-TLS ($sni)..."))

        Thread {
            try {
                Log.i(TAG, "Iniciando cliente túnel TLS/SSH para $host:$port com SNI: $sni")
                broadcastStatus("INJETANDO SNI & CONECTANDO...")

                // 1. Inicia cliente túnel local SOCKS5 na porta 1080
                tunnelClient = SshTlsTunnelClient(
                    remoteHost = host,
                    remotePort = port,
                    sniHost = sni,
                    username = user,
                    password = pass,
                    localSocksPort = 1080
                )
                tunnelClient?.connect()

                broadcastStatus("NEGOCIANDO INTERFACE TUN...")

                // 2. Constrói interface VPN do Android
                val builder = Builder()
                    .setSession("TunnelX VPN")
                    .setMtu(1500)
                    .addAddress("10.0.0.2", 24)
                    .addDnsServer("1.1.1.1")
                    .addDnsServer("8.8.8.8")
                    .addRoute("0.0.0.0", 0)

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    builder.setMetered(false)
                }

                vpnInterface = builder.establish()
                Log.i(TAG, "Interface TUN virtual estabelecida: fd=${vpnInterface?.fd}")

                // 3. Encaminha pacotes IP da interface TUN para o proxy SOCKS5 local
                val fd = vpnInterface?.fd
                if (fd != null) {
                    tun2SocksHandler = Tun2SocksHandler(vpnInterface!!)
                    tun2SocksHandler?.start()
                }

                updateNotification("Conectado: $sni ($host:$port)")
                broadcastStatus("CONECTADO [SSH-TLS]")

            } catch (e: Exception) {
                Log.e(TAG, "Erro ao conectar VPN: ${e.message}", e)
                broadcastStatus("ERRO NA CONEXÃO: ${e.message}")
                stopTunnel()
            }
        }.start()
    }

    private fun broadcastStatus(status: String) {
        val intent = Intent(ACTION_STATUS_UPDATE).apply {
            putExtra("STATUS", status)
            putExtra("BYTES_IN", totalBytesIn)
            putExtra("BYTES_OUT", totalBytesOut)
        }
        sendBroadcast(intent)
    }

    private fun stopTunnel() {
        isRunning.set(false)
        try {
            tun2SocksHandler?.stop()
            tunnelClient?.disconnect()
            vpnInterface?.close()
            vpnInterface = null
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao finalizar VPN", e)
        }
        broadcastStatus("NÃO CONECTADO")
        stopForeground(true)
        stopSelf()
    }

    override fun onDestroy() {
        stopTunnel()
        super.onDestroy()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "TunnelX VPN Notificações",
                NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java)?.createNotificationChannel(channel)
        }
    }

    private fun createNotification(text: String): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("TunnelX VPN")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    private fun updateNotification(text: String) {
        val manager = getSystemService(NotificationManager::class.java)
        manager?.notify(NOTIFICATION_ID, createNotification(text))
    }
}
