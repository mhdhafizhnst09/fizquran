let hafalanData = JSON.parse(localStorage.getItem("hafalanData")) || {};

// Fetch daftar surah
async function fetchSurahs() {
    const response = await fetch('https://equran.id/api/v2/surat');
    const data = await response.json();
    if (data.code === 200) {
        populateSurahSelect(data.data);
    }
}

// Populasi dropdown surah dengan nama dan nomor
function populateSurahSelect(surahs) {
    const surahSelect = document.getElementById("surahSelect");
    surahSelect.innerHTML = `<option value="">--Pilih Surah--</option>`; // Reset dropdown
    surahs.forEach(surah => {
        const option = document.createElement("option");
        option.value = surah.nomor;
        option.textContent = `${surah.namaLatin} (${surah.nama})`;
        surahSelect.appendChild(option);
    });
}

// Memuat detail surah dan ayat setelah surah dipilih
async function loadSurahDetails() {
    const surahSelect = document.getElementById("surahSelect");
    const surahId = surahSelect.value;

    // Jika tidak ada surah yang dipilih, tampilkan pesan
    if (!surahId) {
        document.getElementById("surahName").textContent = "📌 Pilih surah untuk mulai menghafal";
        document.getElementById("ayatList").innerHTML = '';
        return;
    }

    const response = await fetch(`https://equran.id/api/v2/surat/${surahId}`);
    const data = await response.json();

    if (data.code === 200) {
        displaySurahDetails(data.data);
    } else {
        console.error("Gagal memuat data surah");
    }
}

// Menampilkan detail surah dan ayat
function displaySurahDetails(surah) {
    const surahName = document.getElementById("surahName");
    const ayatList = document.getElementById("ayatList");

    surahName.textContent = `${surah.namaLatin} (${surah.nama})`;
    ayatList.innerHTML = ''; // Clear previous ayat

    surah.ayat.forEach(ayat => {
        const ayatId = `${surah.nomor}-${ayat.nomorAyat}`;
        let hafalStatus = hafalanData[ayatId] || { hafal: false, repetitions: 0, lastReviewed: null };

        const ayatItem = document.createElement("div");
        ayatItem.classList.add("ayat-item");

        // Menampilkan ayat Arab
        let hiddenAyat = hafalStatus.hafal ? `<span class="hidden-text">${ayat.teksArab}</span>` : ayat.teksArab;

        ayatItem.innerHTML = `
            <p id="ayatText-${ayatId}">${hiddenAyat}</p>
            <button class="hafal-btn ${hafalStatus.hafal ? 'hafal' : ''}" id="hafal${ayatId}" 
                onclick="toggleHafal('${ayatId}')">
                ${hafalStatus.hafal ? "✔ Hafal" : "✅ Sudah Hafal"}
            </button>
            <button class="uji-btn" id="ujiBtn-${ayatId}" onclick="ujiHafalan('${ayatId}', '${ayat.teksArab}')">📝 Uji Hafalan</button>
        `;

        ayatList.appendChild(ayatItem);
    });

    loadChecklist();
}

// Menandai hafalan ayat
function toggleHafal(ayatId) {
    let hafalBtn = document.getElementById(`hafal${ayatId}`);
    let hafalStatus = hafalanData[ayatId] || { hafal: false, repetitions: 0, lastReviewed: null };

    hafalStatus.hafal = !hafalStatus.hafal;
    hafalanData[ayatId] = hafalStatus;
    localStorage.setItem("hafalanData", JSON.stringify(hafalanData));

    hafalBtn.textContent = hafalStatus.hafal ? "✔ Hafal" : "✅ Sudah Hafal";
    hafalBtn.classList.toggle("hafal");

    updateProgress();
}

// Uji Hafalan: Sembunyikan ayat dan minta pengguna mengingat
function ujiHafalan(ayatId, teksArab) {
    let ayatText = document.getElementById(`ayatText-${ayatId}`);
    // Sembunyikan teks ayat dan tampilkan tombol "Lihat"
    ayatText.innerHTML = `
        <span class="hidden-text">🔒 Ayat Disembunyikan</span>
        <button onclick="tampilkanAyat('${ayatId}', '${teksArab}')">🔍 Lihat Ayat</button>
    `;
}

// Tampilkan kembali ayat setelah diuji hafalan
function tampilkanAyat(ayatId, teksArab) {
    let ayatText = document.getElementById(`ayatText-${ayatId}`);
    // Menampilkan teks ayat setelah diuji hafalan
    ayatText.innerHTML = teksArab;
}

// Simpan checklist hafalan ke local storage
function saveChecklist() {
    const hafalButtons = document.querySelectorAll(".hafal-btn");
    let checklistData = {};

    hafalButtons.forEach(button => {
        checklistData[button.id] = button.classList.contains("hafal");
    });

    localStorage.setItem("hafalanChecklist", JSON.stringify(checklistData));
}

// Load checklist hafalan dari local storage
function loadChecklist() {
    const savedChecklist = JSON.parse(localStorage.getItem("hafalanChecklist"));
    if (!savedChecklist) return;

    const hafalButtons = document.querySelectorAll(".hafal-btn");
    hafalButtons.forEach(button => {
        if (savedChecklist[button.id]) {
            button.classList.add("hafal");
            button.textContent = "✔ Hafal";
        }
    });

    updateProgress();
}

// Hitung progress hafalan
function updateProgress() {
    let hafalCount = document.querySelectorAll(".hafal-btn.hafal").length;
    let totalAyat = document.querySelectorAll(".hafal-btn").length;
    let progress = (hafalCount / totalAyat) * 100;

    document.getElementById("hafalanProgress").value = progress;
    document.getElementById("hafalanPercentage").textContent = `${Math.round(progress)}% Hafal`;
}

// Load daftar surat saat halaman pertama kali dibuka
window.onload = fetchSurahs;
