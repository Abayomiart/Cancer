# TunnelX VPN - SSH · TLS · TUNNEL (Android VpnService)

Aplicativo Android de VPN de alta performance com interface Cyberpunk Dark Neon, suporte nativo ao **Android VpnService**, injeção de **SNI Spoofing** (Bug Hosts para Unitel Angola, Africell, Claro, etc.), túnel SSH-TLS e compilação automatizada via **GitHub Actions**.

---

## 🚀 Como Compilar o APK no GitHub (100% Automático e Gratuito)

Este repositório possui uma pipeline CI/CD pronta em `.github/workflows/build-apk.yml`. Você não precisa ter o Android Studio instalado no seu computador para gerar o `.apk`!

### Passo a passo no GitHub:
1. Suba este código para o seu repositório no GitHub (`git push origin main`).
2. No seu repositório do GitHub, clique na aba **"Actions"** no menu superior.
3. No menu lateral esquerdo, clique no workflow **"Build Android APK (TunnelX VPN)"**.
4. Clique no botão **"Run workflow"** > selecione a branch `main` e confirme.
5. O GitHub Actions executará o Java 17 + Gradle e compilará o APK em cerca de 2 minutos.
6. Quando finalizar com sucesso (ícone verde ✔️), clique na execução concluída.
7. Role até o final da página na seção **"Artifacts"** e baixe o arquivo **`TunnelX-VPN-debug-apk`**.
8. Extraia o ZIP e instale o arquivo `.apk` no seu celular Android!

---

## 💻 Como Compilar Localmente no Android Studio / Terminal

Se preferir compilar localmente na sua máquina:

### Opção 1: Terminal (Linux / macOS / Git Bash)
```bash
cd android
chmod +x gradlew
./gradlew assembleDebug
```
O APK será gerado em:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Opção 2: Terminal (Windows CMD / PowerShell)
```cmd
cd android
gradlew.bat assembleDebug
```

### Opção 3: Android Studio
1. Abra o **Android Studio**.
2. Clique em **File > Open** e selecione a pasta `android/`.
3. Aguarde o Gradle sincronizar as dependências.
4. Clique em **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 🛠️ Arquitetura do Android VpnService

- **`TunnelVpnService.kt`**: Classe que estende `android.net.VpnService`. Configura o descritor de arquivo TUN (`tun0`), atribui o IP virtual `10.0.0.2/24`, rotas globais `0.0.0.0/0`, servidores DNS (`1.1.1.1` e `8.8.8.8`) e gerencia a notificação em primeiro plano com contador de dados.
- **`SshTlsTunnelClient.kt`**: Cria o socket TLS com injeção de SNI (`unitelmoney.com`, etc.) via `SSLSocketFactory` + `SNIHostName`, encapsula a conexão SSH autenticada e abre uma porta de encaminhamento dinâmico SOCKS5 na porta local `1080`.
- **`Tun2SocksHandler.kt`**: Responsável por ler os pacotes IP brutos da interface TUN e encaminhar os dados para o túnel encriptado.
- **`AndroidManifest.xml`**: Registra o serviço com a permissão exigida pelo sistema Android:
  ```xml
  <service
      android:name=".service.TunnelVpnService"
      android:permission="android.permission.BIND_VPN_SERVICE"
      android:exported="false"
      android:foregroundServiceType="systemExempted">
      <intent-filter>
          <action android:name="android.net.VpnService" />
      </intent-filter>
  </service>
  ```

---

## 📱 Recursos Integrados no Web App & Android
- **Monitor de Osciloscópio**: Gráfico em tempo real de tráfego de rede (bps / Kbps / Mbps).
- **Injetor de SNI / Bug Host**: Compatível com hosts de Zero-Rating (ex: `unitelmoney.com`, `portal.unitel.ao`, `internet.africell.ao`).
- **Gerenciador de VPS**: Script 1-Clique para instalação do servidor em Ubuntu/Debian com Stunnel4 e BadVPN UDPGW na porta 7300.
- **Exportador & Importador `.tnlx`**: Compartilhamento de arquivos de configuração criptografados.
- **Scanner de Bug Host**: Testa status HTTP (200, 101, 302) e latência de domínios diretamente pelo backend.
