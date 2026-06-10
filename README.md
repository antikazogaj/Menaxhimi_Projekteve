# Menaxhimi i Projekteve

Sistemi mundëson menaxhimin e projekteve dhe detyrave në ekip. Përfshihen krijimi i projekteve, caktimi i detyrave me afate, statusi i progresit, komentet në detyra dhe dashboard me statistika.

## Udhëzime për instalim (Për Kolegët)

Për të ekzekutuar projektin lokalisht në kompjuterin tuaj, ndiqni hapat e mëposhtëm:

### 1. Konfigurimi i Databazës
1. Krijoni një databazë në MySQL me emrin `taskmanagerdb`.
2. Importoni skedarin **`database_schema.sql`** (që ndodhet në dosjen kryesore) në databazën tuaj MySQL për të krijuar të gjitha tabelat e nevojshme.
    * Mund ta bëni këtë përmes phpMyAdmin, ose nga terminali: `mysql -u root -p taskmanagerdb < database_schema.sql`

### 2. Konfigurimi i Backend-it
1. Hapni terminalin dhe hyni në dosjen e backend-it:
   ```bash
   cd Backend
   ```
2. Instaloni varësitë:
   ```bash
   npm install
   ```
3. Krijoni një skedar të ri me emrin **`.env`** brenda dosjes `Backend` (ose kopjoni `.env.example` dhe riemërtojeni në `.env`). Sigurohuni që përmbajtja të jetë si më poshtë (ndryshoni fjalëkalimin e databazës nëse keni ndonjë):
   ```env
   PORT=5001
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=taskmanagerdb
   JWT_SECRET=kod_shume_i_gjate_dhe_sekret_12345
   ```
4. Nisni serverin e Backend-it:
   ```bash
   npm start
   ```

### 3. Konfigurimi i Frontend-it
1. Hapni një terminal të ri dhe hyni në dosjen e frontend-it:
   ```bash
   cd frontend
   ```
2. Instaloni varësitë:
   ```bash
   npm install
   ```
3. Nisni aplikacionin React:
   ```bash
   npm start
   ```

Aplikacioni do të hapet automatikisht në `http://localhost:3000`. Backend-i do të dëgjojë kërkesat në `http://localhost:5001`.
