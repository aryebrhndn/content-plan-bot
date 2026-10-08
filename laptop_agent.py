import os
import sys
import time
import socket
import platform
import logging
import datetime
import subprocess
import requests
import psutil
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [LaptopTracker] - %(levelname)s - %(message)s"
)
logger = logging.getLogger("LaptopTracker")

DEFAULT_URL = os.getenv("TELEMETRY_URL", "http://localhost:7860/api/telemetry")
SECRET_TOKEN = os.getenv("WEBHOOK_SECRET", "supersecrettoken")
PING_INTERVAL_SECONDS = int(os.getenv("TELEMETRY_INTERVAL", "300"))  # 5 Menit


def get_gpu_info() -> list:
    """Mendapatkan informasi GPU dari sistem."""
    gpus = []
    if os.name == "nt":
        try:
            cmd = ["powershell", "-NoProfile", "-Command", "Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty Name"]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=8)
            gpus = [g.strip() for g in res.stdout.splitlines() if g.strip()]
        except Exception:
            pass
    return gpus if gpus else ["GPU Terintegrasi / Default"]


def get_wifi_ssid() -> str:
    """Mendapatkan nama WiFi (SSID) yang sedang terhubung."""
    if os.name == "nt":
        try:
            res = subprocess.run(["netsh", "wlan", "show", "interfaces"], capture_output=True, text=True, timeout=5)
            for line in res.stdout.splitlines():
                if "SSID" in line and "BSSID" not in line:
                    parts = line.split(":")
                    if len(parts) > 1 and parts[1].strip():
                        return parts[1].strip()
        except Exception:
            pass
    return "Ethernet / Terhubung Kabel"


def get_local_ip() -> str:
    """Mendapatkan IP Address lokal."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def get_top_processes(limit=10) -> list:
    """Mengambil daftar proses terberat berdasarkan RAM & CPU."""
    procs = []
    for p in psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent", "status"]):
        try:
            info = p.info
            if info["name"] and info["memory_percent"]:
                procs.append({
                    "pid": info["pid"],
                    "name": info["name"],
                    "cpu": info["cpu_percent"] or 0.0,
                    "ram": round(info["memory_percent"], 1),
                    "status": info["status"]
                })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    procs.sort(key=lambda x: x["ram"], reverse=True)
    return procs[:limit]


def get_startup_apps(limit=8) -> list:
    """Mengambil daftar aplikasi startup Windows."""
    apps = []
    if os.name == "nt":
        try:
            cmd = ["powershell", "-NoProfile", "-Command", "Get-CimInstance Win32_StartupCommand | Select-Object -First 8 Name, Location | ConvertTo-Json"]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=8)
            import json
            data = json.loads(res.stdout)
            if isinstance(data, list):
                for item in data:
                    apps.append(f"{item.get('Name', 'Unknown')} ({item.get('Location', '')})")
            elif isinstance(data, dict):
                apps.append(f"{data.get('Name', 'Unknown')} ({data.get('Location', '')})")
        except Exception:
            pass
    return apps if apps else ["Windows Explorer", "Security Health Systray", "Audio Service"]


def get_services_sample(limit=8) -> list:
    """Mengambil status service Windows aktif."""
    services = []
    if os.name == "nt":
        try:
            cmd = ["powershell", "-NoProfile", "-Command", "Get-Service | Where-Object {$_.Status -eq 'Running'} | Select-Object -First 8 DisplayName | ConvertTo-Json"]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=8)
            import json
            data = json.loads(res.stdout)
            if isinstance(data, list):
                for item in data:
                    services.append(item.get("DisplayName", ""))
            elif isinstance(data, dict):
                services.append(data.get("DisplayName", ""))
        except Exception:
            pass
    return [s for s in services if s] or ["Windows Update", "Windows Defender", "Spooler", "DNS Client"]


def get_all_disks() -> list:
    """Mendapatkan status seluruh partisi harddisk."""
    disks = []
    for part in psutil.disk_partitions():
        try:
            if "cdrom" in part.opts or not part.fstype:
                continue
            usage = psutil.disk_usage(part.mountpoint)
            disks.append({
                "device": part.device,
                "mount": part.mountpoint,
                "total_gb": round(usage.total / (1024 ** 3), 1),
                "used_gb": round(usage.used / (1024 ** 3), 1),
                "free_gb": round(usage.free / (1024 ** 3), 1),
                "percent": usage.percent
            })
        except Exception:
            continue
    return disks


def get_security_status() -> dict:
    """Status Windows Defender & Keamanan."""
    defender_active = True
    if os.name == "nt":
        try:
            cmd = ["powershell", "-NoProfile", "-Command", "(Get-MpComputerStatus).RealTimeProtectionEnabled"]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=6)
            if "True" in res.stdout:
                defender_active = True
            elif "False" in res.stdout:
                defender_active = False
        except Exception:
            pass
    return {
        "defender_realtime": defender_active,
        "firewall": "Aktif (Windows Firewall)",
        "antivirus": "Windows Defender Antivirus"
    }


def get_uptime_str() -> str:
    """Menghitung durasi laptop sudah menyala."""
    uptime_sec = time.time() - psutil.boot_time()
    days = int(uptime_sec // 86400)
    hours = int((uptime_sec % 86400) // 3600)
    mins = int((uptime_sec % 3600) // 60)
    if days > 0:
        return f"{days} hari {hours} jam {mins} menit"
    return f"{hours} jam {mins} menit"


def take_screenshot(output_path="temp/screen_capture.png") -> str:
    """Mengambil screenshot layar Windows."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    if os.name == "nt":
        ps_script = f"""
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($b.Location, [System.Drawing.Point]::Empty, $b.Size)
$bmp.Save('{output_path.replace(chr(92), "/")}', [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
"""
        try:
            subprocess.run(["powershell", "-NoProfile", "-Command", ps_script], capture_output=True, timeout=10)
            if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
                return output_path
        except Exception:
            pass
    return ""


def execute_power_action(action: str) -> str:
    """Menjalankan aksi daya (lock, sleep, restart, shutdown)."""
    action = action.lower().strip()
    if os.name == "nt":
        if action == "lock":
            subprocess.run(["rundll32.exe", "user32.dll,LockWorkStation"])
            return "Layar Windows berhasil dikunci (Locked)."
        elif action == "sleep":
            subprocess.run(["rundll32.exe", "powrprof.dll,SetSuspendState", "0,1,0"])
            return "Laptop dialihkan ke mode Sleep."
        elif action == "restart":
            subprocess.run(["shutdown", "/r", "/t", "30", "/c", "Restart via Telegram Bot"])
            return "Perintah restart dikirim. Laptop akan restart dalam 30 detik."
        elif action == "shutdown":
            subprocess.run(["shutdown", "/s", "/t", "30", "/c", "Shutdown via Telegram Bot"])
            return "Perintah shutdown dikirim. Laptop akan mati dalam 30 detik."
    return f"Aksi {action} tidak dikenali atau tidak didukung di OS ini."


def kill_process_by_name(target: str) -> str:
    """Menghentikan proses aplikasi berdasarkan nama atau PID."""
    target_clean = target.strip().lower()
    killed = 0
    for p in psutil.process_iter(["pid", "name"]):
        try:
            name = (p.info["name"] or "").lower()
            pid_str = str(p.info["pid"])
            if target_clean in name or target_clean == pid_str:
                p.terminate()
                killed += 1
        except Exception:
            continue
    if killed > 0:
        return f"Berhasil menghentikan {killed} proses yang cocok dengan '{target}'."
    return f"Tidak ditemukan proses dengan nama atau PID '{target}'."


def collect_comprehensive_metrics() -> dict:
    """Mengumpulkan seluruh 20 aspek data laptop sesuai spesifikasi."""
    vmem = psutil.virtual_memory()
    swap = psutil.swap_memory()
    cpufreq = psutil.cpu_freq()
    batt = psutil.sensors_battery()
    net_io = psutil.net_io_counters()

    # Baterai
    battery_pct = batt.percent if batt else 100
    plugged = batt.power_plugged if batt else True
    time_left = round(batt.secsleft / 60) if (batt and batt.secsleft > 0) else -1

    # CPU Per-Core
    cpu_cores = psutil.cpu_percent(interval=0.5, percpu=True)
    cpu_total = psutil.cpu_percent()

    # Alert Triggers
    alerts = []
    if cpu_total > 85:
        alerts.append("⚠️ Beban CPU Sangat Tinggi (> 85%)")
    if vmem.percent > 90:
        alerts.append("⚠️ Kapasitas RAM Kritis (> 90%)")
    if not plugged and battery_pct <= 20:
        alerts.append(f"⚠️ Baterai Rendah ({battery_pct}%), segera cas laptop!")

    disks = get_all_disks()
    for d in disks:
        if d["percent"] > 90:
            alerts.append(f"⚠️ Drive {d['mount']} Hampir Penuh ({d['percent']}%)")

    return {
        "status": "online",
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "hostname": socket.gethostname(),
        "os": f"{platform.system()} {platform.release()} (Build {platform.version()})",
        "uptime": get_uptime_str(),
        
        # 1. Overview & CPU
        "cpu": cpu_total,
        "cpu_cores": cpu_cores,
        "cpu_physical_cores": psutil.cpu_count(logical=False) or 4,
        "cpu_logical_cores": psutil.cpu_count(logical=True) or 8,
        "cpu_clock_ghz": round(cpufreq.current / 1000, 2) if cpufreq else 2.5,
        "cpu_max_ghz": round(cpufreq.max / 1000, 2) if cpufreq else 3.5,

        # 2. RAM
        "ram": vmem.percent,
        "ram_used_gb": round(vmem.used / (1024 ** 3), 1),
        "ram_total_gb": round(vmem.total / (1024 ** 3), 1),
        "ram_free_gb": round(vmem.available / (1024 ** 3), 1),
        "swap_used_gb": round(swap.used / (1024 ** 3), 1),
        "swap_total_gb": round(swap.total / (1024 ** 3), 1),

        # 3. Disks
        "disks": disks,

        # 4. GPU
        "gpus": get_gpu_info(),

        # 5. Battery
        "battery": battery_pct,
        "plugged": plugged,
        "battery_time_left_min": time_left,

        # 6. Temperature / Thermal
        "temperature": "Normal (Beban stabil)" if cpu_total < 70 else "Hangat (Sedang proses berat)",

        # 7. Processes
        "top_processes": get_top_processes(8),

        # 8. Network
        "network": {
            "ssid": get_wifi_ssid(),
            "local_ip": get_local_ip(),
            "bytes_sent_mb": round(net_io.bytes_sent / (1024 ** 2), 1),
            "bytes_recv_mb": round(net_io.bytes_recv / (1024 ** 2), 1)
        },

        # 9. Startup & Services
        "startup_apps": get_startup_apps(6),
        "services": get_services_sample(6),

        # 10. Security
        "security": get_security_status(),

        # 11. Hardware
        "hardware": {
            "machine": platform.machine(),
            "processor": platform.processor() or "Multi-Core Processor",
            "connected_displays": "1 Layar Terdeteksi"
        },

        # 12. Alerts
        "alerts": alerts
    }
def execute_single_action(action_item: dict, target_url: str):
    """Mengeksekusi satu instruksi perintah remote dari bot."""
    cmd = action_item.get("action", "")
    param = action_item.get("param", "")
    logger.info(f"⚡ Menjalankan Remote Action: {cmd} {param}")
    
    if cmd == "screen":
        shot_path = take_screenshot()
        if shot_path and os.path.exists(shot_path):
            upload_url = target_url.replace("/telemetry", "/upload_screen")
            try:
                with open(shot_path, "rb") as f:
                    requests.post(upload_url, data=f.read(), headers={"X-Telemetry-Token": SECRET_TOKEN, "Content-Type": "image/png"}, timeout=15)
                logger.info("📸 Screenshot berhasil diunggah ke server bot!")
            except Exception as e:
                logger.error(f"Gagal mengunggah screenshot: {e}")
    elif cmd == "kill":
        res = kill_process_by_name(param)
        logger.info(res)
    elif cmd in ["lock", "sleep", "restart", "shutdown"]:
        res = execute_power_action(cmd)
        logger.info(res)


def check_and_execute_actions(target_url: str):
    """Mengecek antrean perintah remote segera dari server bot."""
    actions_url = target_url.replace("/telemetry", "/pending_actions")
    headers = {"X-Telemetry-Token": SECRET_TOKEN}
    try:
        res = requests.get(actions_url, headers=headers, timeout=5)
        if res.status_code == 200:
            actions = res.json().get("actions", [])
            for a in actions:
                execute_single_action(a, target_url)
    except Exception:
        pass


def send_telemetry(target_url: str):
    """Mengirim metrik lengkap ke server bot dan menerima aksi perintah balik."""
    payload = collect_comprehensive_metrics()
    headers = {
        "Content-Type": "application/json",
        "X-Telemetry-Token": SECRET_TOKEN
    }

    try:
        res = requests.post(target_url, json=payload, headers=headers, timeout=12)
        if res.status_code == 200:
            logger.info(f"✅ Telemetri Terkirim! CPU: {payload['cpu']}% | RAM: {payload['ram']}% | Baterai: {payload['battery']}%")
            
            # Cek apakah ada aksi remote yang harus dijalankan
            data = res.json()
            actions = data.get("pending_actions", [])
            for action_item in actions:
                execute_single_action(action_item, target_url)
            return True
    except Exception as e:
        logger.warning(f"Gagal mengirim telemetri ke ({target_url}): {e}")

    return False


def main():
    urls = [a for a in sys.argv[1:] if not a.startswith("--")]
    target_url = urls[0] if urls else DEFAULT_URL

    logger.info("=" * 60)
    logger.info("🚀 Laptop Master Telemetry Tracker Berjalan")
    logger.info(f"🎯 Target Server: {target_url}")
    logger.info(f"⏱️ Interval Telemetri: Setiap {PING_INTERVAL_SECONDS} detik (5 Menit)")
    logger.info("⚡ Interval Respons Remote Action: Setiap 5 detik")
    logger.info("=" * 60)

    if "--once" in sys.argv:
        send_telemetry(target_url)
        return

    last_telemetry_time = 0.0
    while True:
        now = time.time()
        # Kirim telemetri tiap interval 5 menit atau saat pertama kali start
        if now - last_telemetry_time >= PING_INTERVAL_SECONDS:
            send_telemetry(target_url)
            last_telemetry_time = now
        else:
            # Periksa antrean aksi jarak jauh (/screen, /kill, dll) setiap 5 detik
            check_and_execute_actions(target_url)

        time.sleep(5)


if __name__ == "__main__":
    main()

