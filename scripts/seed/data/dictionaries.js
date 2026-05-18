// =============================================================================
// Skillio Seed · Realistic Indonesian-flavored content dictionaries
// =============================================================================

/* -------------------------------------------------------------------------- */
/*  USERS — names + professions + bios                                        */
/* -------------------------------------------------------------------------- */

export const FIRST_NAMES = [
  'Aldi', 'Adit', 'Ari', 'Ayu', 'Bagas', 'Bayu', 'Bella', 'Bima',
  'Cinta', 'Citra', 'Dian', 'Dimas', 'Dito', 'Eka', 'Eko', 'Elsa',
  'Fajar', 'Faiz', 'Fani', 'Farah', 'Galih', 'Gita', 'Hana', 'Hadi',
  'Ilham', 'Indah', 'Intan', 'Ivan', 'Jihan', 'Joko', 'Karin', 'Kevin',
  'Laila', 'Lukman', 'Maya', 'Mira', 'Naufal', 'Nabila', 'Niko', 'Nina',
  'Olivia', 'Pandu', 'Putra', 'Putri', 'Raka', 'Rama', 'Rani', 'Reza',
  'Rifqi', 'Rina', 'Rizky', 'Sasa', 'Salman', 'Sinta', 'Tania', 'Tegar',
  'Umar', 'Vania', 'Wira', 'Wulan', 'Yoga', 'Yola', 'Zaki', 'Zahra',
  'Andin', 'Brian', 'Chandra', 'Devi', 'Erika', 'Fina', 'Gilang', 'Haris',
  'Iqbal', 'Jasmine', 'Krisna', 'Lia', 'Melati', 'Nadia', 'Oki', 'Prita',
]

export const LAST_NAMES = [
  'Pratama', 'Saputra', 'Putri', 'Permata', 'Hartanto', 'Wibowo', 'Anggraini',
  'Kusuma', 'Lestari', 'Maulana', 'Nugroho', 'Prabowo', 'Rahman', 'Santoso',
  'Setiawan', 'Sulistyo', 'Tanjung', 'Utomo', 'Wijaya', 'Yusuf', 'Hakim',
  'Hidayat', 'Iskandar', 'Kurniawan', 'Sari', 'Aditya', 'Pranata', 'Mahendra',
  'Cahyani', 'Effendi', 'Gunawan', 'Mulyadi', 'Nasution', 'Salim', 'Wahyudi',
]

export const PROFESSIONS = [
  { role: 'Mahasiswa Informatika',        topics: ['Technology', 'Study Tips', 'AI Tools', 'Productivity'] },
  { role: 'Junior Frontend Developer',    topics: ['Technology', 'Design', 'Career'] },
  { role: 'UI/UX Designer',               topics: ['Design', 'Productivity', 'Content Creation'] },
  { role: 'Content Creator',              topics: ['Content Creation', 'Photography', 'Lifestyle'] },
  { role: 'Freelance Writer',             topics: ['Writing', 'Freelance', 'Personal Growth'] },
  { role: 'Digital Marketer',             topics: ['Career', 'Content Creation', 'Entrepreneurship'] },
  { role: 'Product Manager',              topics: ['Career', 'Productivity', 'Personal Growth'] },
  { role: 'Data Analyst',                 topics: ['Technology', 'AI Tools', 'Career'] },
  { role: 'Mahasiswa DKV',                topics: ['Design', 'Photography', 'Content Creation'] },
  { role: 'Mahasiswa Manajemen',          topics: ['Career', 'Finance', 'Entrepreneurship'] },
  { role: 'Founder Startup Mahasiswa',    topics: ['Entrepreneurship', 'Productivity', 'Personal Growth'] },
  { role: 'Backend Engineer',             topics: ['Technology', 'AI Tools', 'Career'] },
  { role: 'Mobile App Developer',         topics: ['Technology', 'Productivity'] },
  { role: 'Notion Power User',            topics: ['Productivity', 'Study Tips', 'Personal Growth'] },
  { role: 'Personal Finance Enthusiast',  topics: ['Finance', 'Personal Growth', 'Lifestyle'] },
  { role: 'Fitness Coach Pemula',         topics: ['Fitness', 'Lifestyle', 'Motivation'] },
  { role: 'Music Producer Bedroom',       topics: ['Music', 'Content Creation', 'Lifestyle'] },
  { role: 'Photographer Hobbyist',        topics: ['Photography', 'Lifestyle', 'Content Creation'] },
  { role: 'Mahasiswa S2 Bisnis',          topics: ['Career', 'Entrepreneurship', 'Personal Growth'] },
  { role: 'Remote Worker',                topics: ['Remote Work', 'Productivity', 'Lifestyle'] },
  { role: 'AI Builder Indie',             topics: ['AI Tools', 'Technology', 'Entrepreneurship'] },
  { role: 'Konselor Karir Pemula',        topics: ['Career', 'Personal Growth', 'Motivation'] },
  { role: 'Game Developer Hobbyist',      topics: ['Gaming', 'Technology', 'Content Creation'] },
  { role: 'Mahasiswa Psikologi',          topics: ['Personal Growth', 'Lifestyle', 'Motivation'] },
  { role: 'Freelance Illustrator',        topics: ['Design', 'Freelance', 'Content Creation'] },
]

export const BIO_TEMPLATES = [
  '{role} yang lagi belajar {topic1} dan {topic2}.',
  'Belajar {topic1} sambil dokumentasi proses di sini.',
  '{role}. Sharing apa yang aku pelajari setiap minggu.',
  'Suka nulis tentang {topic1}, {topic2}, dan hal-hal kecil yang bikin produktif.',
  'Curious soul · {topic1} · {topic2} · always learning.',
  '{role} di siang hari, {topic1} enthusiast di malam hari.',
  'Lagi build kebiasaan baru di {topic1}. Doain konsisten 🙏',
  'Sharing insight dari journey aku di {topic1}.',
  'Belajar publik. Catetan singkat soal {topic1} & {topic2}.',
  '{role} | tertarik sama {topic1} & {topic2}.',
]

/* -------------------------------------------------------------------------- */
/*  POST TITLES — natural, social, relatable                                  */
/* -------------------------------------------------------------------------- */

export const TITLE_TEMPLATES_BY_CATEGORY = {
  Productivity: [
    'Hal kecil yang bikin aku lebih fokus belajar',
    'Kebiasaan yang bikin produktivitas naik drastis',
    '3 tools gratis yang ternyata ngebantu banget',
    'Cara aku ngatur to-do list biar nggak overwhelming',
    'Aku coba metode 2-jam fokus, ini hasilnya',
    'Workflow harian yang bikin aku tetap waras',
    'Notion setup minimal yang akhirnya nempel di aku',
  ],
  'Study Tips': [
    'Belajar 1 jam tapi beneran fokus > 5 jam tapi setengah-setengah',
    'Cara aku review materi tanpa kelelahan',
    'Teknik active recall yang aku sesuaikan',
    'Belajar bareng teman ternyata efeknya gede',
    'Strategi belajar tanpa burnout buat anak kuliah',
  ],
  Lifestyle: [
    'Slow morning routine yang bikin hari lebih tenang',
    'Aku detox medsos 7 hari, ini yang berubah',
    'Kebiasaan tidur baru yang bener-bener bantu fokus',
    'Hal-hal kecil yang ngebantu aku tetap waras minggu ini',
  ],
  Career: [
    'Pelajaran terbesar setelah gagal project pertama',
    'Cara aku siapin diri buat first job di industri tech',
    '3 hal yang aku berharap tahu sebelum mulai karir',
    'Cara aku ngomong soal salary di interview pertama',
    'Self-review tahunan yang aku lakuin sendiri',
  ],
  Technology: [
    'Stack yang aku pakai buat side project minggu ini',
    'Belajar TypeScript dari nol, ini catatannya',
    'Kenapa aku akhirnya pindah dari Redux ke Zustand',
    'Setup development environment yang aku rasa nyaman',
    'Refactor code lama: pelajaran setelah 3 hari pusing',
  ],
  'AI Tools': [
    '5 prompt ChatGPT yang aku pakai tiap hari',
    'AI tools yang bener-bener aku pakai (bukan hype)',
    'Cara aku gabungin Notion + AI buat catatan kuliah',
    'Pengalaman pakai Claude buat review tulisan',
    'Workflow research pakai AI buat tugas akhir',
  ],
  Design: [
    'Bedah ulang portofolio: pelajaran dari 10 review',
    'Tipografi adalah 80% kerjaan UI designer',
    'Cara aku nerima feedback design tanpa baper',
    'Workflow Figma harian aku setelah 1 tahun pakai',
    'Hal yang sering kelewat saat handover ke developer',
  ],
  Entrepreneurship: [
    'Cara aku validasi ide tanpa coding seminggu',
    'Ngobrol sama 20 user pertama: insight gak terduga',
    'Pricing pertama produk digital aku, salah-salah',
    'Indie hacker journey: minggu 1 launch',
    'Membedakan ide bagus vs ide yang seru aja',
  ],
  Fitness: [
    'Konsisten olahraga 30 menit di rumah, akhirnya nempel',
    'Catatan progres bench press 3 bulan',
    'Aku stop diet ekstrim, ini gantinya',
    'Mobility routine yang nempel buat anak gabut WFH',
  ],
  Writing: [
    'Cara aku ngalahin writer’s block (versi aku)',
    'Nulis publik 30 hari: pelajaran setelah selesai',
    'Outline dulu vs nulis bebas: aku akhirnya pilih ini',
    'Editing pass yang ngebantu tulisan jadi lebih clear',
  ],
  Freelance: [
    'Cara aku mulai freelance tanpa pengalaman',
    'Kontrak kerja freelance: hal yang sering aku lupa',
    'Cara nyari klien pertama lewat komunitas',
    'Mengelola revisi tanpa burn out emosional',
  ],
  Motivation: [
    'Kalau lagi malas, aku nerapin trik 5 menit ini',
    'Reminder buat diri sendiri di bulan yang berat',
    'Konsistensi itu boring, tapi paling jujur',
  ],
  'Content Creation': [
    'Konten edukasi 30 hari: data dan pelajaran',
    'Setup recording mini di kamar yang murah',
    'Skrip pendek yang bikin engagement naik',
    'Workflow editing reels yang nyatanya repeatable',
  ],
  'Personal Growth': [
    'Refleksi mid-year yang akhirnya jujur',
    'Cara aku bikin keputusan susah tanpa overthinking',
    'Menyusun goals 90 hari yang masih masuk akal',
    'Hal yang bikin aku tumbuh diam-diam tahun ini',
  ],
  Finance: [
    'Cara aku mulai investasi dengan modal kecil',
    'Budget bulanan yang akhirnya cocok di kantong',
    'Pelajaran setelah dana darurat akhirnya cair',
    'Membedakan want vs need ala anak kos',
  ],
  Music: [
    'Setup home studio murah yang aku banggain',
    'Belajar mixing tanpa engineer, pelajaran gede',
    'Lagu pertama aku rilis di Spotify, ini prosesnya',
  ],
  Photography: [
    'Belajar lighting natural buat indoor portrait',
    'Editing minimal yang bikin foto terasa hangat',
    'Camera lama tetap bagus kalau tau caranya',
  ],
  Gaming: [
    'Pelajaran soft skill yang aku dapet dari gaming',
    'Setup mini buat indie dev yang masih kuliah',
    'Belajar pixel art dari nol, prosesnya gini',
  ],
  'Remote Work': [
    'Routine WFH yang akhirnya ngebantu mental aku',
    'Cara aku set boundary kerja di kosan',
    'Tools komunikasi tim remote yang nyatanya cukup',
  ],
}

export const TITLE_FALLBACK = [
  'Catatan kecil yang aku temukan minggu ini',
  'Pelajaran simpel yang nempel banget',
  'Apa yang aku coba minggu ini dan hasilnya',
]

/* -------------------------------------------------------------------------- */
/*  POST CONTENT — paragraph fragments to mix into realistic bodies           */
/* -------------------------------------------------------------------------- */

export const HOOKS = [
  'Beberapa minggu terakhir aku coba pelan-pelan ngerubah cara kerja, dan sejauh ini efeknya cukup nempel.',
  'Aku ngerasa banyak orang ngalamin masalah yang sama jadi aku coba dokumentasi.',
  'Awalnya iseng, tapi makin lama makin kerasa bedanya. Mau share aja siapa tahu cocok juga buat kamu.',
  'Cerita pendek dari journey aku minggu ini, semoga relatable.',
  'Aku nulis ini bukan karena udah expert, tapi karena baru ngalamin sendiri.',
]

export const POINTS = [
  'Mulai dari yang paling kecil, jangan ngejar ideal.',
  'Konsistensi 20 menit > heroik 3 jam tapi sekali doang.',
  'Buat sistem yang bisa kamu ulang waktu lagi malas.',
  'Jangan terlalu cepat ganti tools sebelum pola kerjanya jelas.',
  'Cari ritme, bukan motivasi. Motivasi numpang lewat.',
  'Note semua proses, biar gampang ngecek mana yang berhasil.',
  'Lebih baik selesai 70% daripada sempurna tapi gak rilis.',
  'Cari komunitas kecil yang bener-bener supportif, energinya beda.',
  'Pakai timer, jangan andelin perasaan "udah lama belum ya".',
  'Rest itu bagian dari kerjaan, bukan musuhnya.',
]

export const CLOSERS = [
  'Kalau kamu lagi di fase yang sama, semangat ya.',
  'Boleh banget share pengalaman kamu di kolom komentar.',
  'Semoga sedikit insight ini bantu satu-dua orang di sini.',
  'Aku update lagi kalau ada perkembangan minggu depan.',
  'Mau dengar versi kamu juga, drop di komentar ya.',
]

/* -------------------------------------------------------------------------- */
/*  COMMENTS — short, medium, replies                                          */
/* -------------------------------------------------------------------------- */

export const COMMENTS_SHORT = [
  'Relate banget sih.',
  'Setuju 100%.',
  'Bagian consistency itu paling susah 😭',
  'Wah, thanks udah sharing!',
  'Ini insight yang aku butuhin hari ini.',
  'Save dulu, baca lagi nanti.',
  'Aku juga ngalamin hal yang sama.',
  'Real banget kak.',
  'Bookmark!',
  'Nice take 🙌',
  'Workflow ini ngebantu banget buat aku.',
  'Auto save ke Notion 😆',
  'Persis kayak yang aku rasain seminggu ini.',
  'Quote-able.',
]

export const COMMENTS_MEDIUM = [
  'Aku nyoba pendekatan yang mirip dan emang efeknya beda banget kalau konsisten.',
  'Bagian soal sistem > motivasi itu udah aku praktekin sebulan dan ini insight banget.',
  'Aku awalnya skeptis sama metode ginian, tapi pas dicoba ternyata lumayan ngubah ritme harian.',
  'Setuju, konsistensi 20 menit setiap hari emang lebih powerful daripada hari kerja 3 jam terus libur seminggu.',
  'Thanks udah sharing insight ini, aku lagi struggle di tahap awal dan ini ngebantu pikiran aku jernih lagi.',
  'Yang paling susah buat aku itu boundary, tapi pelan-pelan udah mulai bisa bilang "selesai dulu" tanpa ngerasa bersalah.',
  'Notion bareng AI itu game changer banget, terutama buat catetan yang gak terstruktur.',
  'Bagian soal jangan cepat ganti tools relate banget, aku selama ini ganti-ganti app malah jadi makin lambat.',
  'Step yang nomor 2 itu paling kerasa di aku, akhirnya kerjaan beneran kelar walau pelan.',
  'Aku setuju soal komunitas kecil, energinya beneran beda kalau saling kenal.',
]

export const COMMENT_REPLIES = [
  'Setuju kak, aku juga gitu awalnya.',
  'Beneran sih, abis baca ini langsung mau coba juga.',
  'Bisa share contoh setup-nya gak kak?',
  'Penjelasan kamu bikin aku lebih ngerti, makasih.',
  'Wah aku belum sampai ke tahap itu, semangat juga buat kamu.',
  'Iya bener, awalnya struggle tapi lama-lama nempel.',
  'Boleh tau referensinya dari mana kak?',
]

/* -------------------------------------------------------------------------- */
/*  THUMBNAILS — Unsplash photos by category, queried via picsum/unsplash CDN */
/* -------------------------------------------------------------------------- */

export const THUMBS_BY_CATEGORY = {
  Productivity: [
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=900',
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=900',
    'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=900',
  ],
  'Study Tips': [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900',
  ],
  Lifestyle: [
    'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=900',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900',
  ],
  Career: [
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900',
  ],
  Technology: [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900',
    'https://images.unsplash.com/photo-1581091215367-59ab6b3a3f7a?w=900',
  ],
  'AI Tools': [
    'https://images.unsplash.com/photo-1677442135722-5f15a2dde3a5?w=900',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900',
  ],
  Design: [
    'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=900',
    'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=900',
  ],
  Entrepreneurship: [
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900',
  ],
  Fitness: [
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900',
  ],
  Writing: [
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900',
  ],
  Freelance: [
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=900',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900',
  ],
  Motivation: [
    'https://images.unsplash.com/photo-1488998427799-e3362cec87c3?w=900',
    'https://images.unsplash.com/photo-1518609571773-39b7d303a87b?w=900',
  ],
  'Content Creation': [
    'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=900',
    'https://images.unsplash.com/photo-1496905583330-eb54c7e5915a?w=900',
  ],
  'Personal Growth': [
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=900',
    'https://images.unsplash.com/photo-1455620611406-966ca6889d2c?w=900',
  ],
  Finance: [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900',
    'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=900',
  ],
  Music: [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900',
    'https://images.unsplash.com/photo-1518972559570-7cc1309f3229?w=900',
  ],
  Photography: [
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900',
    'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=900',
  ],
  Gaming: [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900',
  ],
  'Remote Work': [
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900',
    'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=900',
  ],
}

/* DiceBear avatars — deterministic, free, CDN-hosted. */
export function avatarUrlForUsername(username) {
  const seed = encodeURIComponent(username)
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}
