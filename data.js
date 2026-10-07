// Data petak & bank soal. Tambah/ubah soal di array Q (opsi pertama = jawaban benar).
const T=("start|MULAI|🏁;q|PETAK SOAL|❓;loc|PERPUSTAKAAN|📚;bon|KARTU BONUS|🎁;ch|TANTANGAN MATEMATIKA|🧮;loc|KANTIN|🍎;mis|KARTU MISI|🎯;q|PETAK SOAL|📏;loc|LABORATORIUM|🔬;kt|KARTU TANTANGAN|⚡;"+
"cor|UKS|🏥;q|PETAK SOAL|❓;loc|LAPANGAN|⚽;bon|KARTU BONUS|🎁;ch|TANTANGAN MATEMATIKA|📐;loc|KELAS|🏫;mis|KARTU MISI|🎯;q|PETAK SOAL|🔺;loc|RUANG GURU|👩‍🏫;kt|KARTU TANTANGAN|⚡;"+
"cor|TAMAN|🌳;q|PETAK SOAL|❓;loc|KOPERASI|✏️;bon|KARTU BONUS|🎁;ch|TANTANGAN MATEMATIKA|🧮;loc|PERPUSTAKAAN|📚;mis|KARTU MISI|🎯;q|PETAK SOAL|⬜;loc|KANTIN|🍎;kt|KARTU TANTANGAN|⚡;"+
"cor|AULA SEKOLAH|🎭;q|PETAK SOAL|❓;loc|LABORATORIUM|🔬;bon|KARTU BONUS|🎁;ch|TANTANGAN MATEMATIKA|📐;loc|LAPANGAN|⚽;mis|KARTU MISI|🎯;q|PETAK SOAL|📏;loc|KELAS|🏫;kt|KARTU TANTANGAN|⚡").split(";").map(s=>s.split("|"));
const COL={start:"#ffe27a",q:"#cfe8ff",bon:"#ffd1e8",ch:"#d9c8ff",mis:"#ffd9a8",kt:"#ffbdbd",
PERPUSTAKAAN:"#e2d4ff",KANTIN:"#ffe0b8",LABORATORIUM:"#c4f1de",LAPANGAN:"#d3f5b5",KELAS:"#bde0fb","RUANG GURU":"#ffd3e4",KOPERASI:"#fff0b0",UKS:"#ffd0d0",TAMAN:"#c4f3d0","AULA SEKOLAH":"#ffe9a8"};
const rc=i=>i<=10?[11,11-i]:i<=20?[11-(i-10),1]:i<=30?[1,1+(i-20)]:[1+(i-30),11];

/* ===== Bank soal: o[0] = jawaban benar ===== */
const Q=[
{q:"Keliling bangun datar adalah ...",o:["jumlah panjang seluruh sisinya","luas daerah di dalamnya","panjang salah satu diagonal","jumlah seluruh sudutnya"],e:"Keliling = jumlah panjang semua sisi yang membatasi bangun."},
{q:"Garis-garis yang membatasi sebuah bangun datar disebut ...",o:["sisi","titik sudut","diagonal","sumbu"],e:"Sisi adalah garis yang membatasi bangun datar. Kelilingnya dihitung dari sisi-sisi ini."},
{q:"Berapa banyak sisi yang dimiliki persegi?",o:["4","3","5","6"],e:"Persegi punya 4 sisi yang sama panjang."},
{q:"Berapa banyak sisi yang dimiliki segitiga?",o:["3","4","2","5"],e:"Segitiga dibatasi 3 sisi."},
{q:"Persegi panjang memiliki ... pasang sisi yang sama panjang.",o:["2","1","3","4"],e:"Sisi panjang sepasang dan sisi lebar sepasang, jadi ada 2 pasang."},
{q:"Keliling persegi dengan panjang sisi 7 cm adalah ...",f:["s","7 cm"],o:["28 cm","14 cm","49 cm","21 cm"],e:"4 × 7 = 28 cm."},
{q:"Keliling persegi panjang berikut adalah ...",f:["r","12 cm","5 cm"],o:["34 cm","17 cm","60 cm","29 cm"],e:"12 + 5 + 12 + 5 = 34 cm, atau 2 × (12 + 5) = 34 cm."},
{q:"Keliling segitiga berikut adalah ...",f:["t","6 cm","8 cm","10 cm"],o:["24 cm","18 cm","48 cm","14 cm"],e:"6 + 8 + 10 = 24 cm."},
{q:"Persegi panjang berukuran panjang 15 cm dan lebar 9 cm. Kelilingnya ...",o:["48 cm","24 cm","135 cm","39 cm"],e:"2 × (15 + 9) = 48 cm."},
{q:"Keliling sebuah persegi 36 cm. Berapa panjang sisinya?",o:["9 cm","6 cm","12 cm","18 cm"],e:"Sisi = keliling : 4 = 36 : 4 = 9 cm."},
{q:"Keliling persegi panjang 30 cm dan panjangnya 9 cm. Berapa lebarnya?",o:["6 cm","21 cm","12 cm","15 cm"],e:"Setengah keliling = 15. Lebar = 15 − 9 = 6 cm."},
{q:"Segitiga sama sisi memiliki panjang sisi 11 cm. Kelilingnya ...",o:["33 cm","22 cm","44 cm","121 cm"],e:"Tiga sisi sama panjang: 3 × 11 = 33 cm."},
{q:"Keliling segitiga 30 cm. Dua sisinya 9 cm dan 12 cm. Panjang sisi ketiga adalah ...",o:["9 cm","21 cm","12 cm","3 cm"],e:"30 − (9 + 12) = 9 cm."},
{q:"Taman berbentuk persegi panjang berukuran 20 m × 10 m. Pak Budi memasang pagar mengelilingi taman. Panjang pagar yang dibutuhkan ...",o:["60 m","30 m","200 m","40 m"],e:"Pagar mengelilingi taman = keliling = 2 × (20 + 10) = 60 m."},
{q:"Lapangan berbentuk persegi dengan sisi 25 m. Dina berlari mengelilingi lapangan 2 kali. Jarak yang ditempuh Dina ...",o:["200 m","100 m","50 m","625 m"],e:"Satu putaran = 4 × 25 = 100 m. Dua putaran = 200 m."},
{q:"Persegi bersisi 6 cm dan persegi panjang 8 cm × 3 cm. Bangun mana yang kelilingnya lebih panjang?",o:["Persegi (24 cm)","Persegi panjang (22 cm)","Sama panjang","Tidak bisa dibandingkan"],e:"Persegi: 4 × 6 = 24 cm. Persegi panjang: 2 × (8 + 3) = 22 cm."},
{q:"Dua persegi bersisi 4 cm ditempel sehingga membentuk persegi panjang 8 cm × 4 cm. Keliling bangun gabungannya ...",o:["24 cm","32 cm","16 cm","48 cm"],e:"Sisi yang menempel tidak ikut dihitung. 2 × (8 + 4) = 24 cm."},
{q:"Ibu membuat bingkai foto berukuran 30 cm × 20 cm dan menghias tepinya dengan pita. Pita yang dibutuhkan paling sedikit ...",o:["100 cm","50 cm","600 cm","80 cm"],e:"Pita mengikuti tepi bingkai: 2 × (30 + 20) = 100 cm."},
{q:"Kolam renang anak berbentuk persegi panjang 14 m × 6 m. Di tepinya dipasang tali pembatas. Panjang tali ...",o:["40 m","20 m","84 m","26 m"],e:"2 × (14 + 6) = 40 m."},
{q:"Bangun apa yang kelilingnya dihitung dengan 4 × sisi?",o:["Persegi","Persegi panjang","Segitiga sembarang","Trapesium"],e:"Keempat sisi persegi sama panjang, sehingga keliling = 4 × sisi."},
{q:"Sebuah segitiga memiliki sisi 5 cm, 7 cm, dan 9 cm. Kelilingnya ...",f:["t","5 cm","7 cm","9 cm"],o:["21 cm","16 cm","45 cm","14 cm"],e:"5 + 7 + 9 = 21 cm."}
];
const MIS=[["Kamu membantu guru mengukur papan tulis. +10 poin",{p:10}],["Kamu menemukan penggaris ajaib! Maju 2 petak",{m:2}],["Meteranmu tertinggal di kelas. Mundur 1 petak",{m:-1}],["Kamu membantu teman mengerjakan PR. +5 poin",{p:5}]];
const BON=[["Bintang bonus! +5 poin",{p:5}],["Hadiah dari wali kelas. +10 poin",{p:10}],["Super bonus! +15 poin",{p:15}],["Dadu ajaib! Maju 3 petak",{m:3}]];

module.exports={T,Q,MIS,BON};
