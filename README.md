# PIXEL RACER 3D — OFFLINE STANDALONE RACING GAME

Game balap arcade 3D stylized (Three.js + React + TypeScript) yang 100% offline dan siap dikemas menjadi:
- **Windows Desktop Standalone (.exe)** menggunakan **Electron**
- **Android Standalone App (.apk)** menggunakan **Capacitor**

---

## 1. STRUKTUR PROYEK

- `src/` — Seluruh kode game Three.js, visual shader, fisika mobil, procedural highway, synthesizer audio, HUD, garage, dan menu.
- `public/` — Aset ikon aplikasi (`icon.png`, `icon.ico`).
- `electron/` — Script native desktop (`main.cjs` & `preload.cjs`).
- `android/` — Native Android Studio project lengkap (`MainActivity.java`, `AndroidManifest.xml`, gradle scripts).
- `capacitor.config.json` — Konfigurasi aplikasi Android Capacitor.
- `package.json` — Konfigurasi build pipeline untuk Web, Windows Electron, dan Android Capacitor.

---

## 2. CARA BUILD DI KOMPUTER / LAPTOP

Pastikan komputer Anda sudah terinstal **Node.js (v18+)**.

### Langkah Awal:
```bash
# 1. Masuk ke folder hasil ekstrak project
cd pixel-racer-3d

# 2. Install semua dependencies
npm install

# 3. Build file game offline (menghasilkan folder dist/)
npm run build
```

---

## 3. BUILD APLIKASI WINDOWS (.EXE)

Menghasilkan **`PIXEL RACER 3D.exe`** mandiri (bukan Chrome/browser, melainkan aplikasi desktop native Windows):

```bash
npm run electron:build
```

- **Lokasi Output**: `dist-electron/PIXEL RACER 3D.exe` (Versi Portable) dan `dist-electron/PIXEL RACER 3D Setup.exe` (Versi Installer NSIS).
- **Test Mode Desktop Langsung**: Jalankan `npm run electron:dev` untuk mencoba game langsung di jendela desktop Electron.

---

## 4. BUILD APLIKASI ANDROID (.APK)

Menghasilkan **`PIXEL_RACER_3D.apk`** aplikasi Android mandiri (bukan membuka browser):

### Menggunakan Android Studio (Paling Mudah):
```bash
# Sinkronkan web build ke folder Android
npx cap sync android

# Buka proyek langsung di Android Studio
npx cap open android
```
Di Android Studio, klik menu:  
**Build > Build Bundle(s) / APK(s) > Build APK(s)**  
File `.apk` akan siap di folder `android/app/build/outputs/apk/debug/app-debug.apk`.

### Menggunakan Command Line (Jika Android SDK & Java terpasang):
```bash
npm run android:build
```
File APK akan berada di `android/app/build/outputs/apk/release/app-release-unsigned.apk`.

---

## 5. MEMAINKAN LANGSUNG SECARA OFFLINE (WEB LOCAL)
Cukup jalankan:
```bash
npm run preview
```
Atau buka file `dist/index.html` dengan web server lokal ringan (seperti `npx serve dist`). Game berjalan 100% offline tanpa koneksi internet.
