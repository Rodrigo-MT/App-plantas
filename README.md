# 🌿 App-plantas

Um aplicativo mobile desenvolvido em **React Native** com **Expo** e **NestJS** no backend, voltado ao cuidado, identificação e acompanhamento de plantas.  
O projeto tem como objetivo oferecer uma experiência interativa, leve e funcional para quem deseja aprender mais sobre o cultivo de plantas e melhorar o cuidado com elas.

---

## 🚀 Tecnologias Utilizadas

### 📱 Frontend
- **React Native** — Framework principal para desenvolvimento mobile multiplataforma.  
- **Expo** — Ferramenta que simplifica o desenvolvimento e emulação.  
- **JavaScript / TypeScript** — Linguagens utilizadas no código-fonte.  
- **React Navigation** — Navegação entre telas.  
- **Axios** — Comunicação com APIs.  
- **AsyncStorage** — Armazenamento local de dados.  
- **Styled Components** — Estilização moderna e componentizada.

### 🖥️ Backend
- **NestJS** — Framework Node.js modular e escalável.  
- **TypeORM** — ORM para manipulação de dados.  
- **PostgreSQL** — Banco de dados relacional robusto.  
- **Class Validator** — Validação de dados de entrada.  
- **Swagger** — Documentação interativa da API.  

---

## 📱 Funcionalidades

- 🌱 Cadastro e listagem de plantas.  
- 🔔 Criação de lembretes para se lembrar de momentos importantes como regar, podar e adubar.  
- 📷 Identificação de plantas por imagem.  
- 🌡️ Informações detalhadas de clima e cuidados.  
- 🪴 Interface amigável e moderna.  

---

## ⚙️ Configuração do Ambiente

### ✅ Pré-requisitos
- Node.js 18+  
- npm ou yarn  
- Expo CLI instalado globalmente  
- PostgreSQL 15+  
- Git

---

## 🚀 Instalação e Execução

### 1️⃣ Clone o Repositório
```bash
git clone https://github.com/rodrigo-martinhago/App-plantas.git
cd App-plantas
```

### 2️⃣ Configuração do Backend
```bash
cd backend
npm install
```

Crie um banco de dados PostgreSQL com o nome `plantcare_db` e verifique se os .env estão corretos.
```

Execute o servidor:
```bash
npm run start:dev
```

A API estará disponível em **http://localhost:3000**  
Documentação Swagger: **http://localhost:3000/api**

---

### 3️⃣ Configuração do Frontend
```bash
cd frontend
npm install
npx expo start
```

- **Android:** abra o app **Expo Go** e escaneie o QR code.  
- **iOS:** abra o **Expo Go** e escaneie o QR code gerado.  
- **Emulador:** pressione `a` (Android) ou `i` (iOS) no terminal.

---

## 💬 Contato do Desenvolvedor

👤 **Rodrigo Martinhago Tachinski**  
📧 **rodrigomartinhago.contato@gmail.com**  
🔗 [LinkedIn — Rodrigo Martinhago Tachinski](https://www.linkedin.com/in/rodrigo-martinhago-tachinski/)

---

📄 **Licença**  
Licenciado sob MIT. Consulte o arquivo LICENSE para detalhes.

---

⭐ *Se este projeto te ajudou, considere deixar uma estrela no repositório!* ⭐
