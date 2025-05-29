<div align="center">
  <img src="https://github.com/user-attachments/assets/5a392f6c-0bbd-4ba8-821c-ebd8779cfde6" alt="FDrive-Beta Logo" width="200" />
  <h1 align="center">🚗 FDrive-Beta 🚀</h1>
  <div align="center">
    Платформа для аренды автомобилей с современным интерфейсом и продвинутым функционалом.
  </div>
</div>
---


## 📌 Основной функционал

- ✅ Регистрация и вход с подтверждением по email-коду
- 🔒 JWT-аутентификация
- 👤 Управление профилем и загрузка документов
- 🚗 Добавление, удаление, обновление автомобилей
- 📨 Уведомления на почту
- 📊 Панель администратора с управлением пользователями и документами

---

## 🛠️ Технологии

### Frontend
- **Angular** ^19.2.0 — основной фреймворк
- **TypeScript** ~5.7.2 — строгая типизация
- **RxJS** ~7.8.0 — реактивное программирование
- **Angular CLI**, **Webpack Dev Server**, **Karma + Jasmine** — сборка, разработка, тесты

### Backend
- **Node.js** с **Express.js** ^5.1.0
- **MongoDB + Mongoose** ^8.13.2 — база данных и ODM
- **bcryptjs**, **jsonwebtoken** — безопасность
- **cors**, **express-validator**, **dotenv**
- **multer** — загрузка файлов
- **nodemailer** — отправка писем

---

## 📁 Структура API

Бэкенд реализован с чётким разделением по сущностям:

### 🔑 Аутентификация
- POST `/auth/registration` — регистрация (отправка кода на email)
- POST `/auth/verify-email` — подтверждение email-кода
- POST `/auth/login` — вход по email+code или username+password
- GET `/auth/profile` — получение профиля
- POST `/auth/profile/update` — обновление профиля (+паспорт)
- DELETE `/auth/users/me` — удаление своего аккаунта
- GET `/auth/users` — просмотр всех пользователей (admin)
- DELETE `/auth/users/:id` — удаление пользователя (admin)

### 🗂️ Документы
- GET `/document/documents` — список непроверенных документов (admin)
- PATCH `/document/documents/:id` — модерация (approve/reject)

### 🚙 Автомобили
- GET `/product/products` — список машин (с фильтрацией по датам)
- GET `/product/product/:id` — детали машины
- POST `/product/addProduct` — добавление машины (с изображениями)
- DELETE `/product/delproduct/:id` — удаление
- PATCH `/product/update/:id` — обновление
- GET `/product/my` — свои машины

### 📅 Аренда
- POST `/rental/create` — создание аренды
- POST `/rental/pay` — оплата аренды
- GET `/rental/my` — свои аренды
- GET `/rental/incoming` — входящие заявки (для владельца авто)
- POST `/rental/update-status` — изменение статуса (paid/cancelled/completed)

---

## ⚙️ Быстрый старт

1. Установите [Node.js](https://nodejs.org/) (рекомендуется 18+).
2. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/MusaBuruzhev/FDrive-Beta-.git
   cd FDrive-Beta-

3.Создайте файл .env в папке Beckend:

**JWT_SECRET=секретный_ключ
**EMAIL_USER=ваш_email
**EMAIL_PASS=пароль_приложения
**MONGO_URI=строка_подключения_MongoDB
**PORT=8080
**CLIENT_URL=http://localhost:4200


4.Установите зависимости и запустите backend:

cd Beckend
npm install
node index.js

5.В новом терминале запустите frontend:

cd FRONT
npm install
npm start

6.Перейдите в браузере: http://localhost:4200



📝 Примечания
Сервер хранит загруженные изображения в папке uploads. Для доступа — http://localhost:8080/uploads/<filename>.

Все защищённые маршруты требуют заголовок:
Authorization: Bearer <token>

Изображения (JPG, JPEG, PNG) до 20 МБ


<div align="center"> <strong>💡 Присоединяйтесь к FDrive-Beta и наслаждайтесь удобной арендой автомобилей!</strong> </div> ```
