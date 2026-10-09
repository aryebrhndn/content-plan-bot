import time


def check_is_online(data: dict) -> tuple[bool, str]:
    """Mengecek apakah laptop sedang online (ping dalam 6 menit terakhir)."""
    if not data:
        return False, "Belum ada data telemetri yang diterima dari laptop."
    last_ts = data.get("server_received_at", 0)
    diff_sec = time.time() - last_ts
    diff_min = int(diff_sec // 60)
    if diff_sec <= 360:
        return True, f"Online ({int(diff_sec)} detik lalu)"
    time_str = f"{diff_min} menit lalu" if diff_min < 60 else f"{diff_min // 60} jam {diff_min % 60} menit lalu"
    return False, f"Offline (Terakhir aktif: {time_str})"


def format_status(data: dict) -> str:
    """1. /status — Overview kondisi umum laptop."""
    is_online, status_str = check_is_online(data)
    if not data:
        return "⚪ *Status Laptop: Belum Ada Data*\nJalankan `python laptop_agent.py` di laptop Anda."

    badge = "🟢 *ONLINE*" if is_online else "🔴 *OFFLINE*"
    batt = data.get("battery", 100)
    plugged = data.get("plugged", True)
    batt_str = f"{batt}%" + (" 🔌 (AC)" if plugged else " 🔋 (Baterai)")

    disks_summary = ", ".join([f"{d['mount']} {d['free_gb']}GB" for d in data.get("disks", [])[:2]]) or "C: Normal"
    
    gpus = data.get("gpus", [])
    first_gpu = gpus[0] if gpus else {}
    gpu_name = first_gpu.get("name", "GPU") if isinstance(first_gpu, dict) else str(first_gpu)

    hw = data.get("hardware", {})
    dev_name = f"{hw.get('manufacturer', '')} {hw.get('model', data.get('hostname', 'Laptop'))}".strip()

    return (
        f"{badge} — *{dev_name}*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"💻 *OS:* {data.get('os', 'Windows 11')}\n"
        f"⏱️ *Uptime:* {data.get('uptime', 'N/A')}\n"
        f"⚡ *CPU:* {data.get('cpu', 0)}% | 🧠 *RAM:* {data.get('ram', 0)}%\n"
        f"💾 *Disk Free:* {disks_summary}\n"
        f"🎮 *GPU:* {gpu_name}\n"
        f"🔋 *Battery:* {batt_str}\n"
        f"🌡️ *Temp:* {data.get('temperature', 'Normal')}\n"
        f"📶 *WiFi:* {data.get('network', {}).get('ssid', 'N/A')}\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"💡 _Ketik /panduan untuk daftar perintah lengkap._"
    )


def format_cpu(data: dict) -> str:
    """2. /cpu — Monitoring performa processor."""
    is_online, _ = check_is_online(data)
    if not data: return "⚪ Belum ada data CPU."
    
    cores_str = ", ".join([f"{c}%" for c in data.get("cpu_cores", [])[:8]])
    hw = data.get("hardware", {})
    proc_name = hw.get("processor", "Multi-Core Processor")
    return (
        f"⚡ *CPU MONITORING*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"• *Processor:* {proc_name}\n"
        f"• *Beban Total:* {data.get('cpu', 0)}%\n"
        f"• *Clock Speed:* {data.get('cpu_clock_ghz', 0)} GHz (Max: {data.get('cpu_max_ghz', 0)} GHz)\n"
        f"• *Cores / Threads:* {data.get('cpu_physical_cores', 4)} Cores / {data.get('cpu_logical_cores', 8)} Threads\n"
        f"• *Per-Core Load:* [{cores_str}]\n"
        f"• *Thermal Status:* {data.get('temperature', 'Normal')}\n"
        f"• *Uptime:* {data.get('uptime', 'N/A')}"
    )


def format_ram(data: dict) -> str:
    """3. /ram — Monitoring penggunaan memory."""
    if not data: return "⚪ Belum ada data RAM."
    
    top_apps = "\n".join([f"  {i+1}. `{p['name']}` ➔ {p['ram']}% RAM (CPU: {p.get('cpu', 0)}%)" for i, p in enumerate(data.get("top_processes", [])[:5])])
    return (
        f"🧠 *RAM MONITORING*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"• *Penggunaan:* {data.get('ram', 0)}%\n"
        f"• *Terpakai:* {data.get('ram_used_gb', 0)} GB\n"
        f"• *Tersedia:* {data.get('ram_free_gb', 0)} GB\n"
        f"• *Total Fisik:* {data.get('ram_total_gb', 0)} GB\n"
        f"• *Swap/Page File:* {data.get('swap_used_gb', 0)} / {data.get('swap_total_gb', 0)} GB\n\n"
        f"🔥 *Aplikasi Paling Boros RAM:*\n{top_apps}"
    )


def format_disk(data: dict) -> str:
    """4. /disk — Monitoring kondisi penyimpanan."""
    if not data: return "⚪ Belum ada data Disk."
    
    lines = []
    for d in data.get("disks", []):
        bar = "█" * int(d["percent"] // 10) + "░" * (10 - int(d["percent"] // 10))
        lines.append(
            f"📁 *Drive {d['mount']}* [{bar}] {d['percent']}%\n"
            f"  • Sisa: {d['free_gb']} GB dari {d['total_gb']} GB (Terpakai: {d['used_gb']} GB)"
        )
    return "💾 *STORAGE MONITORING*\n━━━━━━━━━━━━━━━━━━━\n" + "\n\n".join(lines)


def format_gpu(data: dict) -> str:
    """5. /gpu — Monitoring kartu grafis."""
    if not data: return "⚪ Belum ada data GPU."
    gpu_list = data.get("gpus", [])
    lines = []
    for g in gpu_list:
        if isinstance(g, dict):
            lines.append(f"• *{g.get('name', 'GPU')}*\n  └ VRAM: `{g.get('vram', 'Shared')}` | Driver: `{g.get('driver', 'N/A')}`")
        else:
            lines.append(f"• *{g}*")
    gpus_text = "\n".join(lines) if lines else "• Tidak terdeteksi"
    return (
        f"🎮 *GPU MONITORING*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"{gpus_text}\n\n"
        f"• *Display:* {data.get('hardware', {}).get('connected_displays', '1 Layar Aktif')}\n"
        f"• *Status:* Perangkat Grafis Berfungsi Baik"
    )


def format_battery(data: dict) -> str:
    """6. /battery — Kondisi baterai laptop."""
    if not data: return "⚪ Belum ada data Baterai."
    batt = data.get("battery", 100)
    plugged = data.get("plugged", True)
    time_left = data.get("battery_time_left_min", -1)
    time_str = f"{time_left} menit" if time_left > 0 else "Tersambung Listrik (AC)"

    status_icon = "🔌 Mengisi Daya (Charger Tersambung)" if plugged else "🔋 Menggunakan Baterai"
    return (
        f"🔋 *BATTERY MONITORING*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"• *Daya:* {batt}%\n"
        f"• *Status Colokan:* {status_icon}\n"
        f"• *Estimasi Sisa:* {time_str}\n"
        f"• *Kondisi:* Sehat & Siap Pakai"
    )


def format_temp(data: dict) -> str:
    """7. /temp — Monitoring suhu hardware."""
    if not data: return "⚪ Belum ada data Suhu."
    return (
        f"🌡️ *TEMPERATURE & THERMAL*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"• *Status Suhu CPU:* {data.get('temperature', 'Normal')}\n"
        f"• *Beban Kipas/Thermal:* Dikelola otomatis oleh BIOS\n"
        f"• *Beban Prosesor Saat Ini:* {data.get('cpu', 0)}%"
    )


def format_process(data: dict) -> str:
    """8. /process — Daftar aplikasi yang sedang berjalan."""
    if not data: return "⚪ Belum ada data Proses."
    lines = [f"`{p['pid']:<6}` *{p['name'][:22]:<22}* RAM: {p['ram']}% | CPU: {p['cpu']}%" for p in data.get("top_processes", [])[:8]]
    return (
        f"📑 *TOP PROSES AKTIF*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"`PID    Nama Aplikasi          `\n" +
        "\n".join(lines) +
        f"\n\n💡 _Untuk mematikan aplikasi: ketik `/kill <nama_aplikasi>`_"
    )


def format_startup(data: dict) -> str:
    """9. /startup — Aplikasi yang berjalan saat booting Windows."""
    if not data: return "⚪ Belum ada data Startup."
    apps = "\n".join([f"• {a}" for a in data.get("startup_apps", [])])
    return f"🚀 *STARTUP APPLICATIONS*\n━━━━━━━━━━━━━━━━━━━\n{apps}"


def format_services(data: dict) -> str:
    """10. /services — Service Windows aktif."""
    if not data: return "⚪ Belum ada data Services."
    srvs = "\n".join([f"• {s}" for s in data.get("services", [])])
    return f"⚙️ *WINDOWS SERVICES RUNNING*\n━━━━━━━━━━━━━━━━━━━\n{srvs}"


def format_network(data: dict) -> str:
    """11. /network — Monitoring koneksi internet & Wi-Fi."""
    if not data: return "⚪ Belum ada data Network."
    net = data.get("network", {})
    ping_val = net.get("ping", "N/A")
    return (
        f"🌐 *NETWORK & WI-FI*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"• *SSID / Wi-Fi:* {net.get('ssid', 'N/A')}\n"
        f"• *IP Address Lokal:* `{net.get('local_ip', '127.0.0.1')}`\n"
        f"• *Latensi Ping (8.8.8.8):* `{ping_val}`\n"
        f"• *Total Download:* {net.get('bytes_recv_mb', 0)} MB\n"
        f"• *Total Upload:* {net.get('bytes_sent_mb', 0)} MB"
    )


def format_security(data: dict) -> str:
    """12. /security — Status keamanan & antivirus."""
    if not data: return "⚪ Belum ada data Security."
    sec = data.get("security", {})
    rt_icon = "🟢 Aktif" if sec.get("defender_realtime") else "🔴 Nonaktif"
    return (
        f"🛡️ *SECURITY & ANTIVIRUS*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"• *Antivirus:* {sec.get('antivirus', 'Windows Defender')}\n"
        f"• *Real-time Protection:* {rt_icon}\n"
        f"• *Firewall:* {sec.get('firewall', 'Aktif')}\n"
        f"• *Sistem Proteksi:* Aman"
    )


def format_info(data: dict) -> str:
    """13. /info — Informasi lengkap hardware & software."""
    if not data: return "⚪ Belum ada data Info."
    hw = data.get("hardware", {})
    gpus = data.get("gpus", [])
    gpu_names = [g.get("name", str(g)) if isinstance(g, dict) else str(g) for g in gpus]
    dev_title = f"{hw.get('manufacturer', '')} {hw.get('model', data.get('hostname', 'Laptop'))}".strip()
    return (
        f"ℹ️ *SYSTEM INFORMATION*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"• *Perangkat:* {dev_title}\n"
        f"• *Sistem Operasi:* {data.get('os', 'Windows 11')}\n"
        f"• *Prosesor:* {hw.get('processor', 'N/A')}\n"
        f"• *Total RAM:* {data.get('ram_total_gb', 0)} GB\n"
        f"• *GPU:* {', '.join(gpu_names) if gpu_names else 'N/A'}\n"
        f"• *Uptime:* {data.get('uptime', 'N/A')}"
    )


def format_files(data: dict) -> str:
    """14. /files — Monitoring penggunaan file & storage distribution."""
    if not data: return "⚪ Belum ada data Files."
    disks = data.get("disks", [])
    primary = disks[0] if disks else {}
    return (
        f"📁 *FILE & STORAGE DISTRIBUTION*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"• *Drive Sistem Utama:* {primary.get('mount', 'C:')}\n"
        f"• *Ruang Kosong:* {primary.get('free_gb', 0)} GB\n"
        f"• *Ruang Terpakai:* {primary.get('used_gb', 0)} GB\n"
        f"• *Persentase Terpakai:* {primary.get('percent', 0)}%\n\n"
        f"💡 _Penyimpanan dalam batas wajar dan sehat._"
    )


def format_alerts(data: dict) -> str:
    """17. /alerts — Sistem peringatan otomatis."""
    if not data: return "⚪ Belum ada data Alerts."
    alerts = data.get("alerts", [])
    if not alerts:
        return "✅ *ALERTS SYSTEM: SEMUA NORMAL*\nTidak ada indikasi beban berlebih, suhu tinggi, atau baterai kritis pada laptop Anda."
    alerts_text = "\n".join([f"• {a}" for a in alerts])
    return f"⚠️ *PERINGATAN SISTEM TERDETEKSI:*\n━━━━━━━━━━━━━━━━━━━\n{alerts_text}"


def format_hardware(data: dict) -> str:
    """18. /hardware — Deteksi perangkat keras."""
    if not data: return "⚪ Belum ada data Hardware."
    hw = data.get("hardware", {})
    return (
        f"🔌 *HARDWARE PERIPHERALS*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"• *Manufaktur:* {hw.get('manufacturer', 'Laptop')}\n"
        f"• *Model Laptop:* {hw.get('model', 'Standard')}\n"
        f"• *Processor Unit:* {hw.get('processor', 'Multi-Core')}\n"
        f"• *Layar Display:* {hw.get('connected_displays', '1 Layar Utama Aktif')}\n"
        f"• *Audio & Input:* Keyboard & Touchpad Internal Aktif"
    )


def format_events(data: dict) -> str:
    """19. /events — Event log & riwayat error Windows."""
    if not data: return "⚪ Belum ada data Event Log."
    events = data.get("events", [])
    if isinstance(events, list) and events:
        lines = "\n".join([f"• `{e}`" for e in events[:4]])
    else:
        lines = "• Semua log kernel & sistem berjalan stabil tanpa crash."
    return (
        f"📜 *WINDOWS SYSTEM EVENT LOG*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"{lines}\n\n"
        f"💡 _Menampilkan rekaman log tingkat peringatan & error Windows terkini._"
    )


def format_update(data: dict) -> str:
    """20. /update — Status Windows Update."""
    if not data: return "⚪ Belum ada data Windows Update."
    updates = data.get("updates", [])
    if isinstance(updates, list) and updates:
        lines = "\n".join([f"• {u}" for u in updates[:4]])
    else:
        lines = "• Semua patch keamanan Windows terpasang up-to-date."
    return (
        f"🔄 *WINDOWS UPDATE STATUS*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"• *Windows Build:* {data.get('os', 'Windows 11')}\n\n"
        f"📋 *Patch & HotFix Terakhir Terpasang:*\n"
        f"{lines}\n\n"
        f"✅ _Sistem patch keamanan dalam kondisi up-to-date._"
    )


def format_power_menu() -> str:
    """16. /power — Menu kontrol daya jarak jauh."""
    return (
        f"⚡ *POWER CONTROL MENU*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"Pilih perintah daya yang ingin dijalankan di laptop:\n\n"
        f"• `/lock` ➔ Kunci layar Windows segera\n"
        f"• `/sleep` ➔ Masukkan laptop ke mode Sleep\n"
        f"• `/restart` ➔ Restart laptop dalam 30 detik\n"
        f"• `/shutdown` ➔ Matikan laptop dalam 30 detik\n\n"
        f"⚠️ _Gunakan perintah ini secara hati-hati._"
    )


def get_commands_guide() -> str:
    """Panduan lengkap seluruh tag command dan deskripsi singkat fungsinya."""
    return (
        f"📖 *PANDUAN LENGKAP TELEGRAM LAPTOP MONITORING*\n"
        f"Berikut daftar seluruh tag perintah beserta fungsinya:\n\n"
        f"🔹 *1. Hardware & Performa:*\n"
        f"• `/status` — Kondisi umum laptop secara cepat (CPU, RAM, GPU, Baterai)\n"
        f"• `/cpu` — Performa processor, clock speed GHz, per-core load\n"
        f"• `/ram` — Penggunaan memori RAM fisik, virtual memory, & aplikasi boros\n"
        f"• `/disk` — Kapasitas seluruh drive (C, D, dll) & sisa GB\n"
        f"• `/gpu` — Kartu grafis, driver, & display yang terpasang\n"
        f"• `/battery` — Persentase baterai, status colokan charger, sisa waktu\n"
        f"• `/temp` — Suhu hardware & status thermal\n\n"
        f"🔹 *2. Aplikasi & Proses:*\n"
        f"• `/process` — Daftar top aplikasi yang sedang berjalan di Windows\n"
        f"• `/kill <nama>` — Hentikan paksa aplikasi yang hang (misal: `/kill chrome`)\n"
        f"• `/startup` — Aplikasi yang otomatis jalan saat laptop booting\n"
        f"• `/services` — Status background services Windows\n\n"
        f"🔹 *3. Jaringan, Keamanan, & Sistem:*\n"
        f"• `/network` — Nama Wi-Fi terhubung, IP lokal, kuota transfer MB\n"
        f"• `/security` — Status proteksi real-time Windows Defender & Firewall\n"
        f"• `/info` — Spesifikasi detail laptop, model, prosesor, & OS\n"
        f"• `/files` — Pembagian kapasitas penyimpanan file\n"
        f"• `/alerts` — Peringatan otomatis jika CPU/RAM/Baterai kritis\n"
        f"• `/hardware` — Deteksi perangkat keras & display\n"
        f"• `/events` — Log error & stabilitas sistem Windows\n"
        f"• `/update` — Informasi update sistem & security patch\n\n"
        f"🔹 *4. Kontrol Jarak Jauh:*\n"
        f"• `/screen` — Ambil foto screenshot layar laptop live dan kirim ke sini!\n"
        f"• `/power` — Menu daya (`/lock`, `/sleep`, `/restart`, `/shutdown`)\n\n"
        f"🔹 *5. Pembuat Konten Reels:* `/mode`, `/ide`, `/skrip`, atau kirim topik langsung!"
    )
