# Telegram Laptop Monitoring Bot Feature Specification

## Overview

Dokumen ini berisi daftar 20 fitur monitoring laptop Windows melalui Telegram Bot (`@hajidarimuda_bot`). Setiap fitur memiliki deskripsi fungsi, data yang dicek secara real-time, dan command/tag Telegram yang digunakan.

Arsitektur:
Laptop Windows Agent (`laptop_agent.py`) ➔ Telegram Bot Server (`main.py` di Lokal / Hugging Face Spaces) ➔ Telegram Mobile App

---

## 1. System Overview
- **Tag:** `/status` atau `/laptop`
- **Deskripsi:** Menampilkan kondisi umum laptop secara cepat (Online/Offline badge, device name, uptime, CPU, RAM, Disk, GPU, Baterai, Wi-Fi).

## 2. CPU Monitoring
- **Tag:** `/cpu`
- **Deskripsi:** Monitoring performa prosesor (Total load, clock speed GHz, Core/Threads count, load per core, thermal status).

## 3. RAM Monitoring
- **Tag:** `/ram`
- **Deskripsi:** Melihat penggunaan memori fisik (GB terpakai, GB tersedia, total fisik, swap/page file, dan daftar aplikasi paling boros memori).

## 4. Storage Monitoring
- **Tag:** `/disk`
- **Deskripsi:** Monitoring kapasitas seluruh partisi harddisk/SSD (C:, D:, dll) dengan visualisasi bar dan sisa gigabyte.

## 5. GPU Monitoring
- **Tag:** `/gpu`
- **Deskripsi:** Monitoring kartu grafis, driver yang terpasang, dan display monitor yang aktif.

## 6. Battery Monitoring
- **Tag:** `/battery`
- **Deskripsi:** Melihat kondisi baterai laptop (persentase daya, status colokan charger/AC, dan estimasi waktu tersisa).

## 7. Temperature and Fan Monitoring
- **Tag:** `/temp`
- **Deskripsi:** Monitoring beban termal dan status pendingin laptop.

## 8. Process Manager
- **Tag:** `/process`
- **Deskripsi:** Menampilkan daftar aplikasi aktif yang paling mengonsumsi sumber daya (PID, nama aplikasi, RAM %, CPU %).
- **Command Terkait:** `/kill <nama_aplikasi>` untuk mematikan aplikasi tertentu.

## 9. Startup Application Monitoring
- **Tag:** `/startup`
- **Deskripsi:** Melihat daftar aplikasi yang otomatis berjalan saat Windows booting beserta lokasinya di Registry.

## 10. Windows Services Monitoring
- **Tag:** `/services`
- **Deskripsi:** Memeriksa daftar Windows Services yang sedang berjalan di background.

## 11. Network Monitoring
- **Tag:** `/network`
- **Deskripsi:** Memeriksa koneksi jaringan, SSID Wi-Fi aktif, IP address lokal, serta akumulasi download/upload MB.

## 12. Security Monitoring
- **Tag:** `/security`
- **Deskripsi:** Memeriksa status keamanan sistem, proteksi real-time Windows Defender Antivirus, dan Windows Firewall.

## 13. System Information
- **Tag:** `/info`
- **Deskripsi:** Menampilkan detail spesifikasi laptop (Hostname, Versi OS Windows, Arsitektur CPU, RAM fisik, GPU).

## 14. File Storage Monitoring
- **Tag:** `/files` atau `/recentfiles`
- **Deskripsi:** Memeriksa distribusi penyimpanan file dan drive sistem utama.

## 15. Screenshot Remote
- **Tag:** `/screen`
- **Deskripsi:** Mengambil tangkapan layar (screenshot) Windows secara live dan mengirimkan fotonya langsung ke chat Telegram dalam beberapa detik.

## 16. Power Control
- **Tag:** `/power`
- **Deskripsi:** Menu kontrol daya jarak jauh.
- **Sub-commands:**
  - `/lock` : Kunci layar Windows segera
  - `/sleep` : Masukkan laptop ke mode Sleep
  - `/restart` : Restart laptop dalam 30 detik
  - `/shutdown` : Matikan laptop dalam 30 detik

## 17. Alert System
- **Tag:** `/alerts`
- **Deskripsi:** Sistem peringatan dini otomatis jika CPU > 85%, RAM > 90%, Baterai <= 20%, atau Disk > 90%.

## 18. Hardware Detection
- **Tag:** `/hardware`
- **Deskripsi:** Deteksi peripheral perangkat keras, prosesor, arsitektur, dan display monitor yang terhubung.

## 19. Windows Event Log Monitoring
- **Tag:** `/events`
- **Deskripsi:** Melihat riwayat integritas sistem, kernel event, BSOD check, dan kestabilan Windows.

## 20. Update Monitoring
- **Tag:** `/update`
- **Deskripsi:** Memeriksa status build Windows, keamanan patch, dan driver.

---

## 21. Cheat-Sheet & Panduan di Bot
- **Tag:** `/panduan`
- **Deskripsi:** Menampilkan ringkasan seluruh tag perintah beserta penjelasan singkat kegunaannya langsung di Telegram.
