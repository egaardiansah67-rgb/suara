document.addEventListener("DOMContentLoaded", () => {
  const tombol = document.getElementById("btnMulai");
  const audio = document.getElementById("audioPemutar");
  const pesan = document.getElementById("pesan");

  const TEKS_AWAL = "MULAI";
  const TEKS_ULANG = "PUTAR LAGI";
  const TEKS_MEMUTAR = "MEMUTAR...";

  function tampilkanPesan(teks) {
    pesan.textContent = teks;
    pesan.hidden = false;
  }

  function sembunyikanPesan() {
    pesan.textContent = "";
    pesan.hidden = true;
  }

  // Kembalikan tombol ke kondisi bisa diputar ulang
  audio.addEventListener("ended", () => {
    tombol.disabled = false;
    tombol.textContent = TEKS_ULANG;
    tombol.classList.remove("is-playing");
  });

  audio.addEventListener("error", () => {
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

      // Sukses diputar -> ubah tampilan tombol
      tombol.textContent = TEKS_MEMUTAR;
      tombol.classList.add("is-playing");
    } catch (err) {
      // Tangani error jika audio gagal diputar
      console.error("Gagal memutar audio:", err);
      tombol.textContent = TEKS_ULANG;
      tombol.classList.remove("is-playing");
      tampilkanPesan(
        "Audio gagal diputar. Pastikan file audio/suara.mp3 ada dan formatnya didukung browser."
      );
    }
  });

  // Saat audio sedang diputar dan user klik lagi -> putar ulang dari awal
  // (ditangani juga oleh handler di atas, tapi pastikan tidak error)
  tombol.textContent = TEKS_AWAL;
});
