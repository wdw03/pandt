# PanditPujaWeb cPanel Hosting Guide

Ye guide Hinglish me hai, aur specifically **is project ko cPanel par host karne** ke liye likhi gayi hai.

## Sabse Pehle: cPanel `Create Application` me kya fill karna hai

Agar tum `Setup Node.js App` ya `Application Manager` ke andar `Create Application` screen par ho, to normal case me ye values fill karni hongi:

- **Node.js version**: `20` ya `22`
- **Application mode**: `Production`
- **Application root**: `panditpujaweb/backend`
- **Application URL**:
  - agar poora site main domain par chalana hai: apna main domain select karo
  - agar subdomain par chalana hai: apna subdomain select karo
  - path usually `/` rakho
- **Application startup file**: `server.js`

### Isko exact kaise samjho

Ye project aise chalta hai:

- frontend files root project folder me hain
- backend Node app `backend/` folder me hai
- backend hi poora frontend bhi serve karta hai

Isliye app root **hamesha backend folder** hona chahiye.

### Agar folder extract karne ke baad structure aisa hai

```text
home/
  panditpujaweb/
    index.html
    assets/
    backend/
      server.js
```

to:

- **Application root** = `panditpujaweb/backend`

### Agar galti se double folder ban gaya ho

Jaise:

```text
home/
  panditpujaweb/
    panditpujaweb/
      index.html
      backend/
        server.js
```

to:

- **Application root** = `panditpujaweb/panditpujaweb/backend`

Isliye create karne se pehle `File Manager` me jaake check zarur karna.

---

## `Environment variables` ko cPanel me alag se bharna hai ya file upload karni hai?

Agar tum **alag se cPanel me `Add variable` bharna nahi chahte**, to koi problem nahi.

Is project me tum **seedha `backend/.env` file upload** kar sakte ho.

Ye project ka backend already `backend/.env` read karta hai, isliye:

- cPanel me alag se `Environment variables` bharna **zaroori nahi**
- tum zip ke andar `backend/.env` rakh sakte ho
- ya extract karne ke baad `backend` folder ke andar `.env` bana sakte ho

### Tumhe kaunsi file upload karni hai

Path ye hoga:

```text
panditpujaweb/backend/.env
```

### `backend/.env` file me kya likhna hai

Is file ke andar ye values honi chahiye:

```text
MONGO_URI=mongodb://...ya-apna-mongodb-atlas-uri...
JWT_SECRET=apna-koi-lamba-random-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=Thanathu Madom <your-email@gmail.com>
PROKERALA_CLIENT_ID=your-prokerala-client-id
PROKERALA_CLIENT_SECRET=your-prokerala-client-secret
```

### Simple rule

- agar `backend/.env` file sahi jagah upload hai, to cPanel ke `Environment variables` section ko blank chhod sakte ho
- agar `.env` upload nahi karna chahte, tab hi `Add variable` use karo

### Important notes

- `SMTP_PASS` me **normal Gmail password nahi**, **App Password** use karo
- `JWT_SECRET` simple mat rakho, lamba random secret rakho
- `PORT` manually add karne ki zarurat nahi hai
- `.env` ka naam exactly `.env` hi hona chahiye, `.env.txt` nahi
- file `backend` folder ke andar hi honi chahiye, root folder me nahi

### Best aur easiest method

Tumhare case me easiest method ye hai:

1. apne local project me `backend/.env` ready rakho
2. poora project zip karo
3. cPanel me upload + extract karo
4. `Create Application` me sirf app root aur startup file set karo
5. alag se `Environment variables` fill mat karo

---

## cPanel form fill karne ka quick example

Agar tumhara project folder name `panditpujaweb` hai aur domain ready hai, to form kuch aisa dikhega:

- **Node.js version**: `20`
- **Application mode**: `Production`
- **Application root**: `panditpujaweb/backend`
- **Application URL**: `yourdomain.com`
- **Application startup file**: `server.js`

Phir:

1. `Create` par click karo
2. app create hone ke baad `Open Terminal` ya `Enter to virtual environment` options dekho
3. `npm install` chalao
4. app ko restart karo

---

Project ka current setup:

- frontend static HTML/CSS/JS files root folder me hain
- backend Node.js app `backend/` folder me hai
- backend hi frontend bhi serve karta hai
- admin panel route: `/admin/`
- APIs bhi same backend se chalti hain
- Panchang + Horoscope bhi ab Node backend se hi aa rahe hain

Isliye best deployment pattern ye hai:

- **poora project same structure me upload karo**
- **Node app root `backend` rakho**
- **domain ya subdomain ke root par app chalao**

Important:

- App ko **subfolder** me mat chalao jaise `example.com/pandit` unless tum code me sab absolute paths badalne ko ready ho.
- Best option:
  - `https://yourdomain.com/`
  - ya `https://astro.yourdomain.com/`

---

## 1. cPanel me kya-kya hona chahiye

Hosting plan me ye available hona chahiye:

- `Setup Node.js App` ya `Application Manager`
- `Terminal`
- `File Manager` ya `Git Version Control`
- Node.js support with Passenger

Official cPanel docs:

- How to install a Node.js application:
  https://docs.cpanel.net/knowledge-base/web-services/how-to-install-a-node.js-application/
- Using Passenger applications:
  https://docs.cpanel.net/knowledge-base/web-services/using-passenger-applications/

अगर tumhare cPanel me `Setup Node.js App` nahi dikh raha, to shared hosting provider se bolna padega ki Node.js enable kare.

---

## 2. Project upload ka sahi structure

Server par structure ideally aisa rehna chahiye:

```text
/home/USERNAME/panditpujaweb/
  index.html
  about.html
  contact.html
  horoscope.html
  ...
  style.css
  resposnive.css
  assets/
  backend/
    server.js
    package.json
    .env
    routes/
    models/
    controllers/
```

Important:

- `backend` folder ko alag se mat upload karo aur baaki frontend ko kahin aur mat rakho.
- Kyunki `backend/server.js` parent folder `../` se frontend serve karta hai.

---

## 3. Upload kaise karna hai

2 simple methods:

### Option A: ZIP upload

1. apne local project ka zip banao
2. cPanel `File Manager` open karo
3. home directory ya desired directory me zip upload karo
4. extract karo
5. final folder ka naam rakho: `panditpujaweb`

### Option B: Git se

1. cPanel me `Git Version Control` open karo
2. repo clone karo
3. ensure folder structure same rahe

Note:

- `node_modules` upload karne ki zarurat nahi
- server par `npm install` se dependencies install karna better hai

---

## 4. Node app cPanel me kaise create karna hai

### Recommended values

- **Node.js version**: `20` ya `22`
- **Application mode**: `Production`
- **Application root**: `panditpujaweb/backend`
- **Application URL**:
  - agar subdomain use kar rahe ho: `/`
  - agar main domain use kar rahe ho: `/`
- **Application startup file**: `server.js`

Important:

- Startup file `server.js` hi rakho
- Is project me `app.js` nahi, `server.js` use hota hai

---

## 5. Terminal me dependencies install karna

cPanel Terminal open karke ye run karo:

```bash
cd ~/panditpujaweb/backend
npm install
```

Agar fresh install hai to kabhi-kabhi ye bhi useful hota hai:

```bash
npm install --omit=dev
```

---

## 6. `.env` file kaise set karni hai

Project ka backend env file path:

```text
backend/.env
```

Current code `backend/server.js` me env yahan se load hota hai:

- `backend/.env`
- fallback: root `.env`

Recommended `backend/.env` example:

```env
PROKERALA_CLIENT_ID=your_prokerala_client_id
PROKERALA_CLIENT_SECRET=your_prokerala_client_secret

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_long_random_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="Thanathu Madom <your_email@gmail.com>"

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_TLS_REJECT_UNAUTHORIZED=false
FROM_NAME=Thanathu Madom

PORT=5000
```

### Important notes

- `MONGO_URI` ya `MONGODB_URI` dono supported hain
- Gmail ke liye **normal password mat use karo**
- Gmail ke liye **App Password** use karo
- ProKerala keys baad me admin panel se bhi edit kar sakte ho

---

## 7. MongoDB ke liye kya use karna hai

Recommended:

- MongoDB Atlas

Current backend Atlas ke saath kaam karta hai.

Tip:

- agar `mongodb+srv://...` cPanel server par issue de, to normal seed-list URI use kar sakte ho
- agar DNS/SRV issue aaye, to Atlas hosts manually use karo

---

## 8. Admin user seed kaise karna hai

Project me default admin seed script hai.

Run this:

```bash
cd ~/panditpujaweb/backend
node scripts/seedAdmin.js
```

Ye kya karega:

- default admin create karega
- default site content seed karega

Default admin credentials:

- username: `saranhs`
- password: `saranhs`

Important:

- login ke baad admin password ko future me change karna better rahega

---

## 9. App start / restart ka flow

### cPanel UI se

1. `Setup Node.js App` open karo
2. created app select karo
3. `Run NPM Install` agar option ho to use karo
4. `Restart` ya `Restart App` click karo

### Terminal fallback

cPanel Passenger setup me kabhi-kabhi changes apply karne ke liye:

```bash
cd ~/panditpujaweb/backend
mkdir -p tmp
touch tmp/restart.txt
```

Ye Passenger app restart trigger karta hai.

---

## 10. App kaise open hoga

Agar app root domain/subdomain par mapped hai to:

- Home: `https://yourdomain.com/`
- Admin: `https://yourdomain.com/admin/`
- Contact: `https://yourdomain.com/contact.html`
- Pooja: `https://yourdomain.com/pooja.html`

Admin panel static route backend se serve hota hai.

---

## 11. Is project ke liye recommended production setup

Best practical setup:

### Option 1: Subdomain

- domain: `astro.yourdomain.com`
- app root: `panditpujaweb/backend`
- app URL: `/`

Why best:

- absolute asset paths sahi chalenge
- API paths `/api/...` bhi properly work karenge
- admin panel `/admin/` bhi clean chalega

### Option 2: Main domain

- domain: `yourdomain.com`
- app root: `panditpujaweb/backend`
- app URL: `/`

Ye bhi theek hai, agar domain exclusively isi app ke liye use ho raha ho.

### Avoid

- `yourdomain.com/project`
- `yourdomain.com/app`

Kyuki app me kaafi links aur assets root-relative hain.

---

## 12. Common errors aur unka fix

### Error: `MongoDB connection error: missing MONGO_URI or MONGODB_URI`

Fix:

- `backend/.env` me `MONGO_URI` add karo
- app restart karo

### Error: `querySrv ECONNREFUSED`

Fix:

- Atlas SRV DNS issue ho sakta hai
- normal non-SRV Mongo URI try karo

### Error: `Email could not be sent`

Fix:

- `EMAIL_USER` aur `EMAIL_PASS` check karo
- Gmail ka **App Password** use karo
- normal Gmail password mostly fail karega

### Error: `self-signed certificate in certificate chain`

Fix:

- env me `EMAIL_TLS_REJECT_UNAUTHORIZED=false`
- port `465` aur `EMAIL_SECURE=true` use karo

### Error: app open ho rahi hai but CSS/images nahi aa rahe

Fix:

- ensure app domain root ya subdomain root par chal rahi ho
- subfolder deploy avoid karo
- check structure same ho:
  - `assets/`
  - HTML files
  - `backend/`

### Error: admin panel open ho raha hai but login fail

Fix:

```bash
cd ~/panditpujaweb/backend
node scripts/seedAdmin.js
```

phir default login try karo:

- `saranhs / saranhs`

---

## 13. Hosting ke baad test checklist

Deploy ke baad ye sab manually test karo:

1. home page open ho raha hai
2. mobile navbar work kar raha hai
3. profile drawer open ho raha hai
4. admin panel `/admin/` open ho raha hai
5. admin login kaam kar raha hai
6. pooja slides frontend me aa rahi hain
7. product images frontend me show ho rahi hain
8. Panchang data aa raha hai
9. Horoscope data aa raha hai
10. contact form submit ho raha hai
11. OTP email aa rahi hai
12. kundali/janam prices admin se change karke frontend me reflect ho rahe hain

---

## 14. Recommended deployment commands summary

```bash
cd ~/panditpujaweb/backend
npm install
node scripts/seedAdmin.js
```

Uske baad cPanel se app restart karo.

---

## 15. Final recommendation

Is project ke liye best hosting pattern:

- **cPanel with Node.js support**
- **domain root ya subdomain root deployment**
- **MongoDB Atlas**
- **Gmail App Password**
- **admin panel se dynamic content management**

Agar tumhara cPanel weak shared hosting hai aur Node app unstable behave karti hai, to next best option hoga:

- VPS
- ya Render / Railway / Hostinger VPS / DigitalOcean

Lekin agar cPanel me proper `Setup Node.js App` + Passenger support hai, to ye project wahan deploy ho sakta hai.

---

## 16. Mere side se current code ke hisaab se important notes

Current codebase already:

- `backend/server.js` se frontend + API dono serve karta hai
- `backend/.env` support karta hai
- admin panel `/admin/` path par hai
- ProKerala keys admin panel se edit ho sakti hain
- prices admin panel se frontend me reflect ho sakte hain
- seed script available hai

Isliye deployment mostly configuration ka kaam hai, architecture rewrite ka nahi.
