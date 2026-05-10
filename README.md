# Skillio - Modern Creator Community Platform 🚀

Platform berbagi insight, workflow, dan pengalaman kreatif untuk komunitas kreator Indonesia.

## 🎯 Tentang Skillio

Skillio adalah **creator community platform** yang memungkinkan kreator untuk:
- ✍️ Berbagi insight dan pengalaman
- 🔥 Publikasikan workflow kreatif
- 💡 Bagikan tips dan trik
- 🤝 Terhubung dengan komunitas
- 📚 Simpan konten favorit
- ❤️ Interaksi dengan like & comment

## ✨ Fitur Utama

### Untuk Kreator
- **Buat Post** - Publikasikan insight dengan thumbnail, excerpt, dan konten lengkap
- **Kategori** - Desain, Programming, Marketing, Video Editing, dll
- **Engagement** - Track likes, comments, bookmarks, dan views
- **Profile** - Showcase semua post Anda dengan username unik (@username)

### Untuk Pembaca
- **Feed Modern** - Jelajahi post dari kreator favorit
- **Search & Filter** - Cari berdasarkan keyword dan kategori
- **Bookmark** - Simpan post untuk dibaca nanti
- **Like & Comment** - Berinteraksi dengan konten
- **Creator Profile** - Lihat semua post dari kreator tertentu

### Platform Features
- 🔐 Authentication (Email & Google OAuth)
- 👤 User Profiles dengan username unik
- 📝 Rich post creation dengan thumbnail
- ❤️ Like system dengan auto-count
- 🔖 Bookmark system
- 💬 Comment system
- 👁️ Views tracking
- 🤖 AI Summary support (coming soon)
- ⭐ Premium creator features (coming soon)

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth
- **Routing:** React Router
- **Deployment:** Vercel/Netlify

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/skillio.git

# Masuk ke folder project
cd skillio

# Install dependencies
npm install

# Setup environment variables
# Buat file .env dan isi dengan:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Run development server
npm run dev
```

## 🗄️ Database Setup

1. Buat project baru di [Supabase](https://supabase.com)
2. Run SQL migration files:
   - `database-setup.sql` - Setup profiles table
   - `database-posts-migration.sql` - Setup posts & engagement tables
3. Enable Row Level Security (RLS) policies
4. Update Supabase credentials di `src/services/supabaseClient.js`

## 📁 Project Structure

```
skillio/
├── src/
│   ├── CreatePost.jsx          # Form buat post baru
│   ├── PostCard.jsx            # Card component untuk post
│   ├── PostDetail.jsx          # Detail page post
│   ├── Home.jsx                # Feed utama
│   ├── Profile.jsx             # Profile page
│   ├── SavedPosts.jsx          # Post tersimpan
│   ├── Comments.jsx            # Comment system
│   ├── Login.jsx               # Login page
│   ├── Register.jsx            # Register page
│   ├── Settings.jsx            # Edit profile
│   ├── DashboardNavbar.jsx     # Navbar untuk user login
│   ├── LandingNavbar.jsx       # Navbar untuk landing
│   ├── LandingPage.jsx         # Landing page
│   ├── services/
│   │   └── supabaseClient.js   # Supabase config
│   ├── App.jsx                 # Main app component
│   └── main.jsx                # Entry point
├── public/
│   └── logo.png                # Logo Skillio
├── database-setup.sql          # SQL untuk profiles
├── database-posts-migration.sql # SQL untuk posts
└── MIGRATION-GUIDE.md          # Panduan migrasi
```

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod
```

## 📝 Usage

### Membuat Post

1. Login ke akun Anda
2. Klik tombol "Buat Post" atau "✍️"
3. Isi form:
   - Judul post
   - Ringkasan singkat (excerpt)
   - Konten lengkap
   - Kategori
   - Thumbnail URL (opsional)
4. Klik "Publikasikan Post"

### Interaksi dengan Post

- **Like:** Klik icon ❤️ pada post
- **Bookmark:** Klik tombol 🔖 untuk simpan
- **Comment:** Buka post detail dan tulis komentar
- **Share:** Bagikan link post ke kreator lain

### Profile Setup

1. Klik profile icon di navbar
2. Pilih "Pengaturan"
3. Update:
   - Nama
   - Username (untuk URL: /@username)
   - Bio
   - Avatar URL

## 🎨 Design System

### Colors
- Primary: Purple (#9333ea)
- Accent: Pink (#ec4899)
- Background: Slate (#f8fafc)

### Typography
- Font: Poppins
- Heading: Bold, 2xl-4xl
- Body: Regular, base-lg

### Components
- Cards: Rounded-2xl dengan border
- Buttons: Gradient purple dengan hover effects
- Inputs: Rounded-xl dengan focus ring

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Developer:** Your Name
- **Designer:** Your Name
- **Product:** Your Name

## 📞 Contact

- Website: [skillio.app](https://skillio.app)
- Email: hello@skillio.app
- Twitter: [@skillioapp](https://twitter.com/skillioapp)

---

Made with 💜 by Skillio Team
