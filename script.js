document.addEventListener("DOMContentLoaded", () => {
  const tombol = document.getElementById("btnMulai");
  const audio = document.getElementById("audioPemutar");
  const pesan = document.getElementById("pesan");

  const TEKS_AWAL = "MULAI";
  const TEKS_ULANG = "PUTAR LAGI";
  const TEKS_MEMUTAR = "MEMUTAR...";

  // Penanda apakah audio sedang diputar (untuk kunci halaman)
  let sedangMemutar = false;

  function tampilkanPesan(teks) {
    pesan.textContent = teks;
    pesan.hidden = false;
  }

  function sembunyikanPesan() {
    pesan.textContent = "";
    pesan.hidden = true;
  }

  function setSedangMemutar(status) {
    sedangMemutar = status;
    if (status) {
      // Kunci tombol back dengan menumpuk history
      // Dipanggil setiap mulai memutar agar tombol Back HP / browser tertahan
      try {
        history.pushState({ audioLock: true }, "");
      } catch (e) {
        /* abaikan jika history tidak didukung */
      }
    }
  }

  function bukaKunci() {
    setSedangMemutarFalse();
  }

  function setSedangMemutarFalse() {
    sedangMemutar = false;
  }

  // 1. Cegah refresh / tutup tab / pindah halaman saat audio bunyi.
  // Browser akan menampilkan dialog konfirmasi bawaan:
  // "Perubahan yang Anda buat mungkin tidak disimpan." / "Leave site?"
  window.addEventListener("beforeunload", (e) => {
    if (!sedangMemutar) return;
    e.preventDefault();
    // Chrome membutuhkan returnValue di-set agar dialog muncul
    e.returnValue = "Audio belum selesai. Yakin ingin keluar?";
    return "Audio belum selesai. Yakin ingin keluar?";
  });

  // 2. Cegah tombol Back (browser & HP) saat audio bunyi.
  // Setiap user tekan Back -> kita dorong lagi ke depan + beri peringatan.
  window.addEventListener("popstate", () => {
    if (!sedangMemutar) return;
    try {
      history.pushState({ audioLock: true }, "");
    } catch (e) {
      /* abaikan */
    }
    tampilkanPesan("Tunggu sampai audio selesai dulu, jangan keluar / kembali.");
  });

  // 3. Deteksi user pindah tab / minimize saat audio bunyi (opsional, hanya peringatan).
  // Audio tetap lanjut di background, tapi kita ingatkan saat dia kembali.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && sedangMemutar) {
      console.warn("User pindah tab saat audio diputar.");
    }
    if (!document.hidden && sedangMemutar) {
      tampilkanPesan("Jangan keluar dulu, audio masih diputar...");
      // Sembunyikan lagi otomatis setelah 2 detik agar tidak mengganggu
      setTimeout(() => {
        if (sedangMemutar) sembunyikanPesan();
      }, 2000);
    }
  });

  // Kembalikan tombol ke kondisi bisa diputar ulang + BUKA kunci
  audio.addEventListener("ended", () => {
    bukaKunci();
    tombol.disabled = false;
    tombol.textContent = TEKS_ULANG;
    tombol.classList.remove("is-playing");
  });

  audio.addEventListener("pause", () => {
    // Jika pause bukan karena ended (misal di-pause sistem), tetap anggap selesai dikunci
    // kecuali audio benar-benar masih ingin dilanjutkan. Di sini kita buka kunci
    // hanya jika audio sudah selesai.
    if (audio.ended) {
      bukaKunci();
    }
  });

  audio.addEventListener("error", () => {
    bukaKunci();
    tombol.disabled = false;
    tombol.textContent = TEKS_ULANG;
    tombol.classList.remove("is-playing");
    tampilkanPesan("Audio gagal dimuat. Pastikan file ada di: audio/suara.mp3");
  });

  tombol.addEventListener("click", async () => {
    sembunyikanPesan();

    try {
      // Selalu mulai dari detik 0
      audio.currentTime = 0;

      // Wajib dipanggil langsung dari event klik agar tidak diblokir autoplay
      const hasil = audio.play();

      // audio.play() mengembalikan Promise di browser modern
      if (hasil !== undefined) {
        await hasil;
      }

      // Sukses diputar -> kunci halaman + ubah tampilan tombol
      setSedangMemutar(true);
      tombol.textContent = TEKS_MEMUTAR;
      tombol.classList.add("is-playing");
    } catch (err) {
      // Tangani error jika audio gagal diputar
      console.error("Gagal memutar audio:", err);
      bukaKunci();
      tombol.textContent = TEKS_ULANG;
      tombol.classList.remove("is-playing");
      tampilkanPesan(
        "Audio gagal diputar. Pastikan file audio/suara.mp3 ada dan formatnya didukung browser."
      );
    }
  });

  tombol.textContent = TEKS_AWAL;
});

