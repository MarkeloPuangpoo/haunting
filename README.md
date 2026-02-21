<div align="center">
  <div style="display: flex; justify-content: center; align-items: center; width: 80px; height: 80px; background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); border-radius: 24px; margin: 0 auto 20px auto; box-shadow: 0 10px 30px -10px rgba(255, 107, 107, 0.5);">
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>
  </div>
  
  <h1>💸 HarnTung (หารตังค์)</h1>
  <p><strong>แอปพลิเคชันจัดการค่าใช้จ่ายแสนฉลาด ทริปไหน ปาร์ตี้ไหน ก็ไม่ปวดหัวเรื่องหารเงินอีกต่อไป</strong></p>

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://clerk.com/"><img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  </p>
</div>

<br />

## ✨ ฟีเจอร์หลัก (Key Features)

- **🔐 ระบบสมาชิก:** ยืนยันตัวตนอย่างปลอดภัยด้วย **Clerk** สร้างโปรไฟล์เพื่อจัดการกลุ่มของตัวเองให้เป็นระเบียบยิ่งขึ้น
- **📊 หน้าแดชบอร์ดส่วนตัว:** ดู "วงของฉัน" (My Events) ได้ทั้งหมดในหน้าเดียว (เฉพาะผู้ใช้ที่ล็อกอินเท่านั้น)
- **⚖️ หารได้ 3 แบบไร้ข้อจำกัด:** ตอบโจทย์ทุกการใช้จ่ายด้วยการ *หารเท่าปกติ*, *เลือกคนที่จะหารร่วมกัน*, หรือ *ระบุยอดเงินของแต่ละคนเจาะจงลงไปเลย*
- **🧹 Debt Simplification:** ระบบคำนวณและรวบยอดหนี้อัตโนมัติ ช่วยลดการโอนเงินไปมาที่ซับซ้อนระหว่างเพื่อนๆ (Minimum Transactions)
- **📱 สแกนปุ๊บ โอนปั๊บ (QR PromptPay):** สรุปยอดเคลียร์บิลและสร้าง **QR Code พร้อมจำนวนเงิน** ให้ทันที ไม่ต้องถามเลขบัญชี ไม่ต้องพิมพ์ยอดเอง
- **🤝 เพิ่มเพื่อนได้อิสระ:** รองรับสมาชิกในวงได้ไม่จำกัด เพิ่มลบสมาชิกได้ตลอดเวลา
- **🛡️ ระบบความปลอดภัยข้อมูล:** มาพร้อมหน้า [นโยบายความเป็นส่วนตัว (Privacy Policy)](/privacy) และคุกกี้แบนเนอร์
- **👨‍💻 แผงควบคุมผู้ดูแลระบบ:** ส่วนผู้ดูแล (Admin Dashboard) สำหรับจัดการแอปพลิเคชัน

<br />

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

### Frontend & UI
- **[Next.js 16](https://nextjs.org/) (App Router)** & **React 19**
- **[Tailwind CSS v4](https://tailwindcss.com/)** ดีไซน์กระจกใส (Glassmorphism) สวยงามทันสมัย
- **[Lucide React](https://lucide.dev/)** ชุดไอคอนมินิมอลใช้งานง่าย
- **[qrcode](https://www.npmjs.com/package/qrcode)** ช่วยสร้าง PromptPay ลงเป็นภาพ QR Canvas

### Backend, Auth & Database
- **[Clerk](https://clerk.com/)** ระบบการยืนยันตัวตน (Authentication)
- **[Supabase](https://supabase.com/)** Database (PostgreSQL) และ Data Access Control
- **Next.js Middleware** ควบคุมการเข้าถึงเส้นทางอย่างปลอดภัย

<br />

## 🛠 วิธีติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### สิ่งที่ต้องเตรียม (Prerequisites)
- [Node.js](https://nodejs.org/) (เวอร์ชัน 20 ขึ้นไป)
- บัญชี [Supabase](https://supabase.com/)
- บัญชี [Clerk](https://clerk.com/)

### ขั้นตอนติดตั้ง

1. **โคลนโปรเจกต์ (Clone Repository)**
   ```bash
   git clone https://github.com/MarkeloPuangpoo/haunting.git
   cd harntung
   ```

2. **ติดตั้ง Dependencies**
   ```bash
   npm install
   ```

3. **ตั้งค่าตัวแปรระบบ (Environment Variables)**
   สร้างไฟล์ `.env.local` ไว้ที่ root directory ของโปรเจกต์ และใส่ค่าตามโครงสร้าง:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. **ปรับฐานข้อมูล Supabase**
   ในโหมด SQL Editor ของ Supabase คุณจะต้องมีตารางสำหรับ:
   - `events` (เก็บรายชื่อวง)
   - `members` (เก็บข้อมูลคนในวงและ promptpay_id)
   - `expenses` (เก็บรายการค่าใช้จ่าย)
   - `expense_splits` (เก็บข้อมูลจำนวนเงินที่แบ่งกัน)

5. **รันเซิร์ฟเวอร์ (Development Server)**
   ```bash
   npm run dev
   ```
   เปิดเว็บเบราว์เซอร์และเข้าไปที่ [http://localhost:3000](http://localhost:3000)

<br />

## 📁 โครงสร้างโปรเจกต์ที่สำคัญ (Project Structure)

```text
src/
├── app/                  
│   ├── admin/            # หน้าสำหรับผู้ดูแลระบบ (Dashboard การจัดการระบบ)
│   ├── dashboard/        # หน้าจัดการ 'วงของฉัน' สำหรับผู้ใช้งานแต่ละคน
│   ├── event/[id]/       # หน้าหลักของอีเวนต์ แสดงสมาชิกและรายจ่าย
│   │   └── settle/       # สรุปแบบ "ใครจ่ายใคร" และโชว์หน้า QR Code
│   ├── privacy/          # นโยบายความเป็นส่วนตัว (Privacy Policy)
│   ├── globals.css       # Stylesheets หลัก
│   ├── layout.tsx        # เลย์เอาท์หลัก ครอบคลุมทุกหน้าและ Cookie Consent
│   └── page.tsx          # Landing page สร้างวงใหม่
├── components/           # ส่วนประกอบ UI ที่ใช้บ่อย
│   ├── Footer.tsx        # ส่วนท้ายเว็บไซต์
│   ├── CookieConsent.tsx # แบนเนอร์ขอความยินยอมใช้งานคุกกี้
│   └── ...
├── lib/                  # ระบบหลังบ้านต่างๆ
│   ├── promptpay.ts      # สร้าง PromptPay Payload 
│   ├── settle.ts         # Algorithm คำนวณรวบยอดหนี้ที่สั้นที่สุด
│   ├── supabase.ts       # เชื่อมต่อ Supabase
│   ├── supabaseClient.ts # การเชื่อม Supabase ให้คุยกับ Clerk Auth
│   └── types.ts          # TypeScript Types / Interfaces
└── proxy.ts              # Middleware สำหรับล็อกเส้นทาง (Protect Routes)
```

<br />

## 🤝 การมีส่วนร่วม (Contributing)
โปรเจกต์นี้เปิดกว้างมาก! หากพบปัญหา อยากแนะนำฟีเจอร์เพิ่ม หรือเอาไปต่อยอด สามารถเปิด [Issues](https://github.com/your-username/harntung/issues) หรือสร้าง [Pull Request](https://github.com/your-username/harntung/pulls) มาได้เลยครับ 

## 📜 License
สงวนสิทธิ์แบบ Open-source **[MIT License](LICENSE)** นำไปดัดแปลงและต่อยอดได้อย่างอิสระ
