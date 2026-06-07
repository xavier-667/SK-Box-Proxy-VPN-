package com.skbox.proxyvpn

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.skbox.proxyvpn.service.ProxyVpnService

class MainActivity : ComponentActivity() {

    // Registers the VPN request activity for BIND_VPN_SERVICE permissions without root
    private val vpnRequestLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            startSkBoxVpn()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SkBoxAppTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    VpnDashboard(
                        onConnectRequest = { requestVpnAndStart() },
                        onDisconnectRequest = { stopSkBoxVpn() }
                    )
                }
            }
        }
    }

    private fun requestVpnAndStart() {
        val vpnIntent = VpnService.prepare(this)
        if (vpnIntent != null) {
            // Permission missing, request it via system VPN prompt
            vpnRequestLauncher.launch(vpnIntent)
        } else {
            // Permission already granted, start the background VPN Service
            startSkBoxVpn()
        }
    }

    private fun startSkBoxVpn() {
        val intent = Intent(this, ProxyVpnService::class.java).apply {
            putExtra("CONNECT", true)
        }
        startService(intent)
    }

    private fun stopSkBoxVpn() {
        val intent = Intent(this, ProxyVpnService::class.java).apply {
            putExtra("CONNECT", false)
        }
        startService(intent)
    }
}

// Minimal Theme definition for composing the Android UI
@Composable
fun SkBoxAppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(),
        content = content
    )
}

@Composable
fun VpnDashboard(
    onConnectRequest: () -> Unit,
    onDisconnectRequest: () -> Unit
) {
    var isConnected by remember { mutableStateOf(false) }

    // Settings States
    var bypassLan by remember { mutableStateOf(true) }
    var muxEnabled by remember { mutableStateOf(false) }
    var enableIPv6 by remember { mutableStateOf(true) }
    var trafficSniffing by remember { mutableStateOf(true) }

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("SK Box Proxy VPN", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Text("com.skbox.proxyvpn", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        
        Spacer(modifier = Modifier.height(48.dp))
        
        Button(
            onClick = {
                if (isConnected) {
                    onDisconnectRequest()
                    isConnected = false
                } else {
                    onConnectRequest()
                    isConnected = true
                }
            },
            modifier = Modifier.size(150.dp)
        ) {
            Text(if (isConnected) "STOP" else "CONNECT", style = MaterialTheme.typography.titleLarge)
        }

        Spacer(modifier = Modifier.height(48.dp))

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Network VPN Settings", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.height(16.dp))
                
                SettingRowToggle("Allow Bypass LAN", bypassLan) { bypassLan = it }
                SettingRowToggle("Enable IPv6", enableIPv6) { enableIPv6 = it }
                SettingRowToggle("Mux (Multiplexing)", muxEnabled) { muxEnabled = it }
                SettingRowToggle("Traffic Sniffing", trafficSniffing) { trafficSniffing = it }
            }
        }
    }
}

@Composable
fun SettingRowToggle(title: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(title, style = MaterialTheme.typography.bodyMedium)
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}
