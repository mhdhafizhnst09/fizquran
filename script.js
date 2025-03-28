document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("surah-list")) {
        loadSurahList();
        document.getElementById("select-surah").addEventListener("click", fetchSurah);
        document.getElementById("play-all").addEventListener("click", playAllAudio);
        document.getElementById("stop-audio").addEventListener("click", stopAudio);
    }
});

const API_QURAN = "https://equran.id/api/v2/surat";

function loadSurahList() {
    fetch(API_QURAN)
        .then(response => response.json())
        .then(data => {
            const selectSurah = document.getElementById("surah-list");
            data.data.forEach(surah => {
                const option = document.createElement("option");
                option.value = surah.nomor;
                option.textContent = `${surah.namaLatin} (${surah.nama})`;
                selectSurah.appendChild(option);
            });
        })
        .catch(error => console.error("Gagal memuat daftar surah:", error));
}

function fetchSurah() {
    const surahId = document.getElementById("surah-list").value;
    if (!surahId) return;

    fetch(`${API_QURAN}/${surahId}`)
        .then(response => response.json())
        .then(data => {
            const quranContent = document.getElementById("quran-content");
            quranContent.innerHTML = "";

            data.data.ayat.forEach(ayat => {
                let verseDiv = document.createElement("div");
                verseDiv.classList.add("verse");
                verseDiv.id = `ayat-${ayat.nomorAyat}`;
                verseDiv.innerHTML = `
                    <p class="arabic">${ayat.teksArab}</p>
                    <p class="latin">${ayat.teksLatin}</p>
                    <p class="terjemahan">${ayat.teksIndonesia}</p>
                    <button class="play-button" data-audio="${ayat.audio['01']}" data-ayat="ayat-${ayat.nomorAyat}">▶️ Putar</button>
                `;
                quranContent.appendChild(verseDiv);
            });

            document.querySelectorAll(".play-button").forEach(button => {
                button.addEventListener("click", function () {
                    playAudio(this.dataset.audio, this.dataset.ayat);
                });
            });
        })
        .catch(error => console.error("Gagal mengambil surah:", error));
}

let currentAudio = null;
let audioQueue = [];
let currentIndex = 0;

function playAudio(url, ayatId) {
    if (!url) return;
    if (currentAudio) currentAudio.pause();

    currentAudio = new Audio(url);
    currentAudio.play();

    highlightAyat(ayatId);
    scrollToAyat(ayatId);
}

function playAllAudio() {
    audioQueue = Array.from(document.querySelectorAll(".play-button")).map(button => ({
        audio: button.dataset.audio,
        ayat: button.dataset.ayat
    }));

    if (audioQueue.length === 0) return;
    
    currentIndex = 0;
    playNextInQueue();
}

function playNextInQueue() {
    if (currentIndex >= audioQueue.length) return;
    
    if (currentAudio) currentAudio.pause();
    
    let currentAyat = audioQueue[currentIndex];
    currentAudio = new Audio(currentAyat.audio);
    currentAudio.play();

    highlightAyat(currentAyat.ayat);
    scrollToAyat(currentAyat.ayat);

    currentAudio.onended = () => {
        currentIndex++;
        playNextInQueue();
    };
}

function stopAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    removeHighlight();
    currentIndex = audioQueue.length;
}

function highlightAyat(ayatId) {
    removeHighlight();
    const ayatElement = document.getElementById(ayatId);
    if (ayatElement) {
        ayatElement.classList.add("highlight");
    }
}

function removeHighlight() {
    document.querySelectorAll(".verse").forEach(el => el.classList.remove("highlight"));
}

function scrollToAyat(ayatId) {
    const ayatElement = document.getElementById(ayatId);
    if (ayatElement) {
        ayatElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}
