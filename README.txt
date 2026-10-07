PETUALANGAN MATEMATIKA ONLINE – Keliling Bangun Datar (Kelas 5 SD)

JALANKAN
  node server.js          (butuh Node.js 16+, tanpa npm install)
  buka http://localhost:3000

CARA PAKAI
  Guru : buka alamat situs > "Buat permainan baru" > tampil KODE 4 angka (proyeksikan di layar).
  Siswa: buka alamat situs di perangkat masing-masing > isi kode + nama > Masuk.
  Guru menekan "Mulai permainan". Maks. 8 siswa per kode.
  Guru bisa melempar dadu / melanjutkan / melewati giliran bila siswa terputus.
  Siswa yang tertutup browsernya bisa masuk lagi dengan kode & nama yang sama.

HOSTING
  Satu proses Node saja (status permainan ada di memori). Cocok untuk Render, Railway, Fly.io,
  VPS, atau Glitch: start command "node server.js", port dari variabel PORT.
  Untuk jaringan WiFi sekolah: jalankan di laptop guru, siswa buka http://IP-LAPTOP:3000.
  Jika memakai reverse proxy (nginx), matikan buffering untuk jalur /events.

UBAH ISI: soal & kartu di data.js, aturan di server.js.

EDITOR MATERI (BARU)
  Guru > "Buka panel guru": buat materi baru, edit/salin materi bawaan, simpan sebagai template,
  lalu "Buat room" untuk memakai soal tersebut. Satu soal = pertanyaan + 1 jawaban benar + 1-3
  pilihan salah (+ pembahasan & gambar bangun opsional). Minimal 3 soal per materi.
  Template tersimpan di templates.json (folder DATA_DIR bila diatur, default: folder proyek).
  Di hosting gratis yang diskus-nya sementara, template bisa hilang saat restart: gunakan disk
  persisten atau unduh/cadangkan templates.json secara berkala.
  PIN guru (opsional): jalankan dengan GURU_PIN=1234 node server.js agar hanya guru yang bisa
  membuat room & mengelola template. Windows PowerShell: $env:GURU_PIN=1234; node server.js
