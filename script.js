// Ruh hali değerlerini ve özelliklerini tanımlayan ana nesne
// Bu nesne, uygulamamızda kullanılacak tüm ruh hallerini ve özelliklerini içerir
// Her ruh hali için 3 özellik tanımlanmıştır:
// 1. value: Ruh halinin sayısal değeri (1-5 arası)
// 2. emoji: Ruh halini temsil eden emoji
// 3. color: Ruh halinin arka plan rengi (hex kodu)
const moodValues = {
    'çok-mutlu': { value: 5, emoji: '😄', color: '#ffd700' }, // En yüksek değer (5), sarı renk, mutlu emoji
    'mutlu': { value: 4, emoji: '🙂', color: '#98fb98' },     // Yüksek değer (4), açık yeşil, gülümseyen emoji
    'normal': { value: 3, emoji: '😐', color: '#87ceeb' },     // Orta değer (3), açık mavi, nötr emoji
    'üzgün': { value: 2, emoji: '😔', color: '#ffb6c1' },     // Düşük değer (2), açık pembe, üzgün emoji
    'çok-üzgün': { value: 1, emoji: '😢', color: '#dda0dd' }  // En düşük değer (1), mor, ağlayan emoji
};

/**
 * LocalStorage'dan ruh hali verilerini alan fonksiyon
 * Bu fonksiyon tarayıcının yerel depolama alanından verileri çeker
 * @returns {Array} Kayıtlı ruh hali verilerini içeren dizi
 */
function getMoodData() {
    // localStorage.getItem() fonksiyonu ile 'moodData' anahtarına kaydedilmiş veriyi alır
    // Eğer veri yoksa null döner
    const data = localStorage.getItem('moodData');
    
    // Eğer veri varsa (data !== null ise):
    // 1. JSON.parse() ile JSON formatındaki string'i JavaScript nesnesine çevirir
    // 2. Veri yoksa boş dizi [] döndürür
    return data ? JSON.parse(data) : [];
}

/**
 * Ruh hali verilerini LocalStorage'a kaydeden fonksiyon
 * Bu fonksiyon verileri tarayıcının yerel depolama alanına kaydeder
 * @param {Array} data - Kaydedilecek ruh hali verileri dizisi
 */
function saveMoodData(data) {
    // JSON.stringify() ile JavaScript nesnesini JSON formatına çevirir
    // localStorage.setItem() ile 'moodData' anahtarına veriyi kaydeder
    localStorage.setItem('moodData', JSON.stringify(data));
}

/**
 * Seçilen ruh halini kaydeden ana fonksiyon
 * Bu fonksiyon kullanıcının seçtiği ruh halini ve tarihi alıp veritabanına kaydeder
 * Ayrıca gerekli kontrolleri yapar ve kullanıcıya geri bildirim sağlar
 */
function saveMood() {
    // querySelector ile 'selected' sınıfına sahip ruh hali butonunu seçer
    // Eğer hiçbir buton seçili değilse null döner
    const selectedMood = document.querySelector('.mood-btn.selected');
    
    // getElementById ile tarih input alanından seçili tarihi alır
    const selectedDate = document.getElementById('moodDate').value;
    
    // Ruh hali seçilmemişse kullanıcıya uyarı gösterir ve fonksiyondan çıkar
    if (!selectedMood) {
        alert('Lütfen bir ruh hali seçin!');
        return;
    }
    
    // Tarih seçilmemişse kullanıcıya uyarı gösterir ve fonksiyondan çıkar
    if (!selectedDate) {
        alert('Lütfen bir tarih seçin!');
        return;
    }

    // Seçili butonun data-mood özelliğinden ruh hali değerini alır
    const mood = selectedMood.dataset.mood;
    
    // Mevcut verileri getMoodData() fonksiyonu ile alır
    const moodData = getMoodData();
    
    // findIndex ile seçilen tarihte kayıt var mı kontrol eder
    // Varsa index numarasını, yoksa -1 döner
    const existingIndex = moodData.findIndex(item => item.date === selectedDate);
    
    // Eğer aynı tarihte kayıt varsa günceller, yoksa yeni kayıt ekler
    if (existingIndex !== -1) {
        // Mevcut kaydı yeni ruh hali ile günceller
        moodData[existingIndex].mood = mood;
    } else {
        // Yeni bir kayıt objesi oluşturup diziye ekler
        moodData.push({ date: selectedDate, mood: mood });
    }
    
    // Güncellenmiş verileri kaydeder
    saveMoodData(moodData);
    
    // Arayüzü güncel verilerle yeniler
    updateUI();
    
    // Seçili ruh hali butonunun seçimini kaldırır
    selectedMood.classList.remove('selected');
    
    // Tarih input alanını temizler
    document.getElementById('moodDate').value = '';
}

/**
 * İstatistikleri hesaplayan ve gösteren fonksiyon
 * Bu fonksiyon üç farklı istatistik hesaplar:
 * 1. Toplam kayıt sayısı
 * 2. Ortalama ruh hali
 * 3. En sık görülen ruh hali
 * @param {Array} moodData - Ruh hali verileri dizisi
 */
function updateStats(moodData) {
    // Toplam kayıt sayısını gösterir
    // moodData.length ile dizinin uzunluğunu alır
    document.getElementById('totalRecords').textContent = moodData.length;

    // Ortalama ruh halini hesaplar ve gösterir
    if (moodData.length > 0) {
        // reduce ile tüm ruh hali değerlerinin toplamını hesaplar
        // Her bir kayıt için moodValues[item.mood].value değerini toplar
        const average = moodData.reduce((sum, item) => sum + moodValues[item.mood].value, 0) / moodData.length;
        
        // Math.round ile ortalamayı en yakın tam sayıya yuvarlar
        const roundedAverage = Math.round(average);
        
        // Object.entries ile moodValues nesnesini diziye çevirir
        // find ile ortalamaya karşılık gelen ruh halini bulur
        const averageMood = Object.entries(moodValues).find(([_, data]) => data.value === roundedAverage);
        
        // Ortalama ruh halinin emojisini gösterir
        // Eğer uygun ruh hali bulunamazsa '😐' gösterir
        document.getElementById('averageMood').textContent = averageMood ? averageMood[1].emoji : '😐';
    }

    // En sık görülen ruh halini hesaplar ve gösterir
    if (moodData.length > 0) {
        // Her ruh halinin kaç kez tekrarlandığını sayan nesne
        const moodCounts = {};
        
        // forEach ile her kaydı dolaşır ve sayıları hesaplar
        moodData.forEach(item => {
            // Eğer ruh hali daha önce sayılmamışsa 0'dan başlatır
            // Her tekrarda sayıyı bir artırır
            moodCounts[item.mood] = (moodCounts[item.mood] || 0) + 1;
        });
        
        // Object.entries ile sayıları diziye çevirir
        // sort ile en yüksek sayıya sahip ruh halini bulur
        const mostFrequent = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0];
        
        // En sık görülen ruh halinin emojisini gösterir
        document.getElementById('mostFrequentMood').textContent = moodValues[mostFrequent].emoji;
    }
}

/**
 * Arayüzü güncelleyen ana fonksiyon
 * Bu fonksiyon tablo ve istatistikleri güncel verilerle yeniler
 * Her veri değişikliğinde çağrılır
 */
function updateUI() {
    // Mevcut verileri alır
    const moodData = getMoodData();
    
    // İstatistikleri günceller
    updateStats(moodData);
    
    // Tablo elementini seçer
    const historyTable = document.getElementById('moodHistory');
    // Tablonun içeriğini temizler
    historyTable.innerHTML = '';
    
    // Verileri tarihe göre sıralar ve tabloya ekler
    moodData
        // sort ile tarihleri büyükten küçüğe sıralar
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        // forEach ile her kaydı dolaşır
        .forEach(item => {
            // Yeni bir tablo satırı oluşturur
            const row = document.createElement('tr');
            // Satırın içeriğini HTML olarak ayarlar
            row.innerHTML = `
                <td>${formatDate(item.date)}</td>
                <td><span class="mood-emoji">${moodValues[item.mood].emoji}</span> ${item.mood}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-danger" onclick="deleteMood('${item.date}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="editMood('${item.date}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            // Oluşturulan satırı tabloya ekler
            historyTable.appendChild(row);
        });
}

/**
 * Tarihi formatlayan yardımcı fonksiyon
 * Bu fonksiyon tarihi Türkçe formatında gösterir
 * @param {string} dateString - Formatlanacak tarih string'i
 * @returns {string} Formatlanmış tarih string'i
 */
function formatDate(dateString) {
    // String'i Date nesnesine çevirir
    const date = new Date(dateString);
    // toLocaleDateString ile Türkçe formatta tarihi döndürür
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',    // Günü iki haneli göster
        month: '2-digit',  // Ayı iki haneli göster
        year: 'numeric'    // Yılı tam sayı olarak göster
    });
}

/**
 * Ruh hali kaydını silen fonksiyon
 * Bu fonksiyon kullanıcıdan onay alarak seçilen tarihteki kaydı siler
 * @param {string} date - Silinecek kaydın tarihi
 */
function deleteMood(date) {
    // Kullanıcıdan onay alır
    if (confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
        // Mevcut verileri alır
        const moodData = getMoodData();
        // filter ile seçilen tarihteki kaydı hariç tutar
        const newData = moodData.filter(item => item.date !== date);
        // Güncellenmiş verileri kaydeder
        saveMoodData(newData);
        // Arayüzü günceller
        updateUI();
    }
}

/**
 * Ruh hali kaydını düzenleme moduna alan fonksiyon
 * Bu fonksiyon seçilen kaydın bilgilerini form alanlarına doldurur
 * @param {string} date - Düzenlenecek kaydın tarihi
 */
function editMood(date) {
    // Mevcut verileri alır
    const moodData = getMoodData();
    // find ile düzenlenecek kaydı bulur
    const mood = moodData.find(item => item.date === date);
    
    if (mood) {
        // Tarih input alanını doldurur
        document.getElementById('moodDate').value = date;
        // İlgili ruh hali butonunu seçer
        const moodButton = document.querySelector(`[data-mood="${mood.mood}"]`);
        
        if (moodButton) {
            // Önceki seçimleri temizler
            document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
            // Yeni seçimi işaretler
            moodButton.classList.add('selected');
        }
    }
}

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', () => {
    // Bugünün tarihini alır ve formatlar
    const today = new Date().toISOString().split('T')[0];
    // Tarih input alanına bugünün tarihini yazar
    document.getElementById('moodDate').value = today;
    
    // Ruh hali butonları için tıklama olaylarını ekler
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Önceki seçimleri temizler
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
            // Tıklanan butonu seçili yapar
            btn.classList.add('selected');
        });
    });
    
    // Kaydet butonu için tıklama olayını ekler
    document.getElementById('saveMood').addEventListener('click', saveMood);
    
    // Sayfa yüklendiğinde arayüzü günceller
    updateUI();
}); 