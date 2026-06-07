package com.skbox.proxyvpn.service

import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor

class ProxyVpnService : VpnService() {
    private var vpnInterface: ParcelFileDescriptor? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val connect = intent?.getBooleanExtra("CONNECT", false) ?: false
        if (connect) {
            setupVpn()
        } else {
            stopVpn()
        }
        return START_STICKY
    }

    private fun setupVpn() {
        if (vpnInterface != null) return

        try {
            val builder = Builder()
            builder.setSession("SK Box Proxy")
            
            // Standard generic tun routing config 
            builder.addAddress("172.19.0.1", 30)
            builder.addDnsServer("8.8.8.8")
            builder.addDnsServer("1.1.1.1")
            
            // Route all IPv4 traffic
            builder.addRoute("0.0.0.0", 0)
            
            // Note: In Sing-Box core, you would typically bind to the physical network
            // and exclude your own package or protect the underlying sockets.
            // Example:
            // builder.addDisallowedApplication(packageName)
            // this.protect(socket)
            
            vpnInterface = builder.establish()
            
            val fd = vpnInterface?.fd ?: return
            
            // TODO: Initialize Sing-box core with parsed JSON and pass the file descriptor
            // Example:
            // Box.start(configJson, fd)
            
        } catch (e: Exception) {
            e.printStackTrace()
            stopVpn()
        }
    }

    private fun stopVpn() {
        // TODO: Call Sing-box stop method via native JNI call
        // Box.stop()
        
        vpnInterface?.close()
        vpnInterface = null
        stopSelf()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopVpn()
    }
}
