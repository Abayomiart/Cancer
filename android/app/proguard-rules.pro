# JSch SSH rules
-keep class com.jcraft.jsch.** { *; }
-dontwarn com.jcraft.jsch.**

# TunnelX VpnService rules
-keep class com.tunnelx.vpn.service.** { *; }
-keep class com.tunnelx.vpn.tunnel.** { *; }
