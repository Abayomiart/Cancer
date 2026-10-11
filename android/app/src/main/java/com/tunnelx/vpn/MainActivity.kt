package com.tunnelx.vpn

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.VpnService
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.tunnelx.vpn.service.TunnelVpnService

class MainActivity : AppCompatActivity() {

    companion object {
        private const val VPN_REQUEST_CODE = 0x0F
    }

    private lateinit var tvStatus: TextView
    private lateinit var tvHost: TextView
    private lateinit var tvSni: TextView
    private lateinit var btnConnect: Button

    private val vpnReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val status = intent?.getStringExtra("STATUS") ?: return
            val bytesIn = intent.getLongExtra("BYTES_IN", 0L)
            val bytesOut = intent.getLongExtra("BYTES_OUT", 0L)

            tvStatus.text = status
            if (TunnelVpnService.isRunning.get()) {
                btnConnect.text = getString(R.string.btn_disconnect)
                btnConnect.setBackgroundColor(0xFFDC2626.toInt()) // Red
            } else {
                btnConnect.text = getString(R.string.btn_connect)
                btnConnect.setBackgroundColor(0xFF10B981.toInt()) // Green
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        tvStatus = findViewById(R.id.tv_status)
        tvHost = findViewById(R.id.tv_host)
        tvSni = findViewById(R.id.tv_sni)
        btnConnect = findViewById(R.id.btn_connect)

        tvHost.text = "144.91.72.243:443"
        tvSni.text = "unitelmoney.com (Angola Unitel)"

        btnConnect.setOnClickListener {
            if (TunnelVpnService.isRunning.get()) {
                disconnectVpn()
            } else {
                requestVpnPermissionAndConnect()
            }
        }

        updateUiState()
    }

    override fun onResume() {
        super.onResume()
        val filter = IntentFilter(TunnelVpnService.ACTION_STATUS_UPDATE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(vpnReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(vpnReceiver, filter)
        }
        updateUiState()
    }

    override fun onPause() {
        super.onPause()
        try {
            unregisterReceiver(vpnReceiver)
        } catch (e: Exception) {
            // Ignorar se já cancelado
        }
    }

    private fun updateUiState() {
        if (TunnelVpnService.isRunning.get()) {
            tvStatus.text = "CONECTADO [SSH-TLS]"
            btnConnect.text = getString(R.string.btn_disconnect)
        } else {
            tvStatus.text = "NÃO CONECTADO"
            btnConnect.text = getString(R.string.btn_connect)
        }
    }

    private fun requestVpnPermissionAndConnect() {
        // Solicita autorização de VPN nativa do Android (Diálogo oficial com chave VPN)
        val intent = VpnService.prepare(this)
        if (intent != null) {
            startActivityForResult(intent, VPN_REQUEST_CODE)
        } else {
            onActivityResult(VPN_REQUEST_CODE, Activity.RESULT_OK, null)
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == VPN_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK) {
                startVpnService()
            } else {
                Toast.makeText(this, "Permissão de VPN recusada pelo usuário", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun startVpnService() {
        val serviceIntent = Intent(this, TunnelVpnService::class.java).apply {
            action = TunnelVpnService.ACTION_CONNECT
            putExtra("EXTRA_HOST", "144.91.72.243")
            putExtra("EXTRA_PORT", 443)
            putExtra("EXTRA_SNI", "unitelmoney.com")
            putExtra("EXTRA_USER", "tunnelx")
            putExtra("EXTRA_PASS", "tunnelx123")
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }

        tvStatus.text = "ESTABELECENDO TÚNEL SSH-TLS..."
    }

    private fun disconnectVpn() {
        val serviceIntent = Intent(this, TunnelVpnService::class.java).apply {
            action = TunnelVpnService.ACTION_DISCONNECT
        }
        startService(serviceIntent)
        tvStatus.text = "DESCONECTANDO..."
    }
}
