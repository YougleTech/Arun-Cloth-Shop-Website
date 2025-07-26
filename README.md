
# 🧵 Arun Cloth Shop Website

A modern, mobile-friendly B2B wholesale fabric ordering platform built for Arun Cloth Shop. The website allows garment retailers, tailors, and business buyers to browse textile collections, request wholesale quotes, and engage digitally with the shop.

> 🔧 Built by **Yougle Tech**  
>  ⏱ Timeline: 2–3 weeks | 🌐 Tech Stack: Django, React, Tailwind CSS, MySQL, VPS

---

## 🚀 Features

### 🛍️ Client-Facing (Frontend)
- Responsive homepage with fabric categories and promo banners
- Product catalog with advanced filters (GSM, material, color, usage)
- Product detail pages with images, specifications, and pricing
- Quote request form with WhatsApp integration
- Client dashboard to view quote history and upload POs/invoices
- Blog section for fabric education and SEO
- Contact page with Google Maps and business hours
- Multilingual support (English/Nepali) *(optional)*

### 🔧 Admin Panel (Backend)
- Secure login/logout (JWT Auth)
- Manage products, prices, tags ("New", "Hot"), and availability
- View, respond to, and export quote requests
- Upload homepage banners
- View client database
- Create and edit blog posts via rich editor

---

## 🧰 Tech Stack

| Layer         | Technology         |
|---------------|--------------------|
| Frontend      | React.js + Tailwind CSS |
| Backend       | Django + Django REST Framework |
| Database      | MySQL              |
| Auth          | JWT (SimpleJWT)    |
| Hosting       | VPS (Linux + Gunicorn + Nginx) |
| Version Control | Git + GitHub     |

---

## 📁 Project Structure

```
arun-cloth-shop/
├── backend/ (Django project)
├── frontend/ (React project)
├── media/ (uploaded files)
├── static/ (static files)
├── .env
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repo
```bash
git clone https://github.com/YougleTech/Arun-Cloth-Shop-Website.git
cd Arun-Cloth-Shop-Website
```

### 2. Backend Setup (Django)
```bash
cd backend
python -m venv env
source env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup (React + Tailwind)
```bash
cd ../frontend
npm install
npm run dev
```

---

## 📦 Deployment Notes

- Production uses **Gunicorn + Nginx** on a **VPS** with **SSL**
- `.env` files manage secrets (e.g., DB credentials, API keys)
- Static/media files served via Nginx
- Frontend is built and deployed via `npm run build`

---

## 📌 Project Status

- ✅ Sprint Planning Complete
- ✅ Backend Models & APIs Defined
- ✅ Frontend Wireframes Ready
- 🚧 Implementation in Progress

---

## 👥 Contributors

- 👨‍💻 YougleTECH Team
- 👔 Arun Cloth Shop – Client

---

## 📄 License

This project is licensed for private commercial use under agreement with Arun Cloth Shop. Redistribution or reuse without permission is prohibited.

---

## 🙌 Acknowledgments

