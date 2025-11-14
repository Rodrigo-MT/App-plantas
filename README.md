# 🌿 App-plantas

Um aplicativo mobile desenvolvido em **React Native** com **Expo** e **NestJS** no backend, voltado ao cuidado, identificação e acompanhamento de plantas.  
O projeto tem como objetivo oferecer uma experiência interativa, leve e funcional para quem deseja aprender mais sobre o cultivo de plantas e melhorar o cuidado com elas.

## ⚠️ Aviso sobre a plataforma

Este aplicativo foi desenvolvido **para dispositivos móveis**.  
Abrir a versão web pode ocasionar **comportamentos inesperados ou erros**.  
Recomenda-se utilizar um **emulador de dispositivo móvel** para testar ou rodar a aplicação corretamente.

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

## ❌ Ausência de React-Redux

O React-Redux não foi incluído neste projeto por dois motivos principais:
Primeiro, não fazia parte dos requisitos do trabalho, que exigiam a implementação de múltiplas telas, formulários, CRUDs e armazenamento local. Segundo, o aplicativo
foi projetado como um Mini-App de funcionalidades simples, com estados majoritariamente locais e gerenciamento direto nos componentes. Nesse contexto, a utilização
do Redux teria adicionado complexidade desnecessária sem oferecer benefícios reais para o controle do estado global.

Para atender às necessidades de compartilhamento de dados, optou-se pelo gerenciamento interno nos componentes e, quando necessário, pelo uso de props ou de uma
Context API simples, garantindo legibilidade, manutenção e performance adequadas ao escopo do projeto.

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

 # 🌿 App-plantas

Aplicativo mobile (Expo / React Native) com backend em NestJS para gerenciar plantas, lembretes e registros de cuidado.

Este README foi atualizado para facilitar o setup local, explicar a arquitetura e documentar os comandos mais úteis durante o desenvolvimento.

## Índice
- Sobre
- Arquitetura
- Tecnologias
- Como executar (rápido)
- Backend — setup detalhado
- Frontend — setup detalhado
- Variáveis de ambiente importantes
- Testes, lint e scripts úteis
- Dicas e solução de problemas
- Contribuindo
- Licença e contato

---

## Sobre

O projeto contém dois monorepos separados dentro da mesma árvore:
- `backend/` — API construída com NestJS + TypeORM + PostgreSQL.
- `frontend/` — Aplicação mobile com Expo (React Native + TypeScript).

O backend expõe endpoints para gerenciar plantas, espécies, localizações, lembretes e logs de cuidado. A API possui documentação Swagger disponível em /api quando o servidor está rodando.

## Arquitetura (visão rápida)

- Backend (NestJS): módulos organizados por domínio: Plants, Species, Locations, CareReminders e CareLogs. Há uma pasta `src/common` com utilitários compartilhados (validações, helpers de data/imagem etc.).
- Frontend (Expo): código organizado por telas (screens), componentes reutilizáveis (`src/components`) e serviços que conversam com a API (`src/services`). O `src/services/api.ts` centraliza a configuração do Axios.

## Tecnologias

- Backend: Node.js, NestJS, TypeORM, PostgreSQL, class-validator, TypeScript, Swagger...
- Frontend: Expo, React Native, TypeScript, Axios, react-hook-form, zod...

---

## Como executar (rápido)

1. Configure o banco PostgreSQL e as variáveis de ambiente (veja seção abaixo).
2. Rode o backend:

	cd backend
	npm install

	# Importante — ordem recomendada para bancos totalmente novos
	# -------------------------------------------------------
	# Em alguns cenários (especialmente quando o banco foi recém-criado),
	# a primeira inicialização da aplicação NestJS precisa ocorrer antes de
	# rodar comandos de migração/seed. Isso acontece porque a aplicação pode
	# criar estruturas ou preparar o ambiente na primeira execução; tentar
	# rodar `npm run migrate:run` em um banco totalmente vazio pode gerar
	# erros (por exemplo, tabelas ausentes) e levar a confusão.

	# Fluxo recomendado quando o banco é novo:
	# 1) Inicie o backend uma vez e aguarde que ele suba (npm run start:dev).
	#    Verifique os logs para confirmar que a conexão com o banco foi estabelecida.
	# 2) Execute as migrations (se necessário):
	#    npm run migrate:run
	# 3) Rode o seed idempotente para repopular dados de exemplo (opcional):
	#    npm run seed

	# Se o banco já possuir o esquema (ou você já rodou migrations antes),
	# pode executar `npm run migrate:run` diretamente quando necessário.

	# Inicie o backend em modo dev (comando final para desenvolvimento):
	npm run start:dev

3. Rode o frontend:

	cd frontend
	npm install
	npx expo start

4. Abra o app usando o Expo Go (dispositivo físico) ou emulador.

---

## Backend — setup detalhado

Requisitos: Node.js 18+, npm, PostgreSQL.

1. Instale dependências

	cd backend
	npm install

2. Crie um banco de dados PostgreSQL (ex: `plantcare_db`).

3. Variáveis de ambiente

Para facilitar a inicialização do projeto por se tratar de um trabalho acadêmico, arquivos `.env` com valores de desenvolvimento estão incluídos no repositório. Esses arquivos contêm apenas valores de exemplo para uso local (host/porta/usuário padrão, timeouts e URLs locais).

Atenção de segurança: em ambientes de produção NÃO é recomendável versionar ou compartilhar arquivos `.env` com segredos reais (senhas, chaves de API, tokens, etc.). Aqui os `.env` foram disponibilizados apenas por conveniência para o avaliador. Em projetos reais, prefira armazenar segredos em serviços de gestão de segredos ou variáveis de ambiente do ambiente de execução e mantenha um `env.example` com placeholders no repositório.


4. Migrações e seed de dados

- Rodar migrations (cria/esquema) — execute depois que a aplicação NestJS já tiver sido inicializada ao menos uma vez no banco. Se o banco for totalmente novo, siga o fluxo recomendado na seção acima antes de rodar migrations.

	npm run migrate:run

- Seed idempotente: para repopular os dados de exemplo (espécies e locais) sem tocar nas migrations, use o novo comando:

	npm run seed

O fluxo recomendado localmente é: iniciar o backend uma vez (quando o banco for novo), rodar `migrate:run` e depois usar `npm run seed` sempre que quiser repor os dados de exemplo.

5. Iniciar em modo desenvolvimento

	npm run start:dev

Observações:
- A documentação Swagger fica em http://localhost:3000/api (por padrão).
- Em desenvolvimento, o backend habilita CORS para facilitar testes locais.

---

## Frontend — setup detalhado

Requisitos: Node.js, npm, Expo CLI (opcional globalmente), Android/iOS emulator ou Expo Go.

1. Instale dependências

	cd frontend
	npm install

2. Variáveis de ambiente do Expo

O frontend detecta automaticamente a URL base da API usando variáveis públicas do Expo. Exemplo (em desenvolvimento):

  EXPO_PUBLIC_API_URL_DEV_ANDROID=http://10.0.2.2:3000
  EXPO_PUBLIC_API_URL_DEV_IOS=http://localhost:3000
  EXPO_PUBLIC_API_URL_DEV_WEB=http://localhost:3000
  EXPO_PUBLIC_API_URL_PRODUCTION=https://seu-servidor-de-producao
  EXPO_PUBLIC_API_TIMEOUT=10000

Coloque essas variáveis no fluxo de build do Expo ou no seu ambiente local (por exemplo, usando `direnv` ou `expo-cli` env). O valor `10.0.2.2` é útil ao executar o emulador Android do Android Studio.

3. Inicie o Expo

	npx expo start

Em seguida, abra o app via Expo Go (dispositivo real) ou selecione emulador (tecla `a` ou `i` no terminal do Expo). 

---

## Variáveis de ambiente importantes

- Backend (`backend/.env`): PORT, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_SYNCHRONIZE, DB_LOGGING, CORS_ORIGINS
- Frontend (Expo — variáveis públicas): EXPO_PUBLIC_API_URL_DEV_ANDROID, EXPO_PUBLIC_API_URL_DEV_IOS, EXPO_PUBLIC_API_URL_DEV_WEB, EXPO_PUBLIC_API_URL_PRODUCTION, EXPO_PUBLIC_API_TIMEOUT

---

## Testes, lint e scripts úteis

Backend (na pasta `backend`):

- npm run start:dev  # iniciar em modo desenvolvimento
- npm run build      # compilar para produção
- npm run migrate:run # rodar migrações (TypeORM CLI) — cria/atualiza esquema
- npm run seed       # repopular dados de exemplo (idempotente)
- npm run lint       # rodar ESLint
- npm run test       # executar testes (Jest)

Frontend (na pasta `frontend`):

- npx expo start     # iniciar projeto Expo
- npm run lint       # executar lint do Expo (eslint)

---

## Dicas e solução de problemas

- Erro de conexão com PostgreSQL: verifique as credenciais em `backend/.env` e se o banco foi criado.
-- Android Emulator (conexão com backend local): use `10.0.2.2` como host para o emulador do Android Studio.

-- Migrations: quando o projeto estiver em produção, prefira manter `DB_SYNCHRONIZE=false` e aplicar migrações via `npm run migrate:run`.
	Atenção: em bancos totalmente novos, inicie a aplicação NestJS ao menos uma vez antes de executar `migrate:run`. A primeira inicialização pode criar estruturas necessárias; rodar migrations antes dessa etapa pode causar erros e levar à impressão errada de que as migrations não funcionam.

-- Seed: se você usar a opção "excluir todos os dados" no app e quiser repor as espécies/locais de exemplo, rode `npm run seed`. O seed é idempotente e não duplica registros.

-- ImagePicker / imagens: durante desenvolvimento, o app pode enviar data URIs para o backend; o backend aceita data:image/* e URLs http(s). Evite enviar `file://` raw URIs diretas do dispositivo para a API.
- Swagger: se a documentação não estiver visível em `/api`, verifique se o backend iniciou corretamente e na porta esperada.
---

## Mapeamento rápido (onde verificar cada requisito)

Para facilitar a correção, aqui estão os arquivos / telas / endpoints onde cada requisito pode ser verificado rapidamente:

- Frontend — exemplos de arquivos:
	- Navegação e telas: `frontend/app/screens/*` e `frontend/app/_layout.tsx`
	- Componentes reutilizáveis: `frontend/src/components/*`
	- Formulários e validação: `frontend/src/components/FormField.tsx`, `frontend/src/components/DatePickerField.tsx`, e os hooks em `frontend/src/hooks/*`.
	- Cliente HTTP / tratamento de erros: `frontend/src/services/api.ts` e serviços por recurso em `frontend/src/services/*.service.ts`.

- Backend — pontos principais:
	- Módulos e controllers: `backend/src/*/*.controller.ts` (plants, species, locations, care-reminders, care-logs)
	- Services com regras de negócio: `backend/src/*/*.service.ts`
	- DTOs e validações: `backend/src/*/dto/*.ts`
	- Entities: `backend/src/*/entities/*.entity.ts`
	- Migrations e seed: `backend/src/migrations/*.migration.ts` e `backend/src/migrations/seed.ts`
	- Postman collection: `backend/collection.json`

- Swagger (documentação interativa): acesse `http://localhost:3000/api` com o backend rodando.

---

## Resumo dos campos principais por CRUD (exemplos)

Cada CRUD possui pelo menos 5 campos variados; abaixo estão os campos mais relevantes para checagem rápida:

- Plants (Plantas): id, name, speciesName (ou speciesId), locationName (ou locationId), plantedAt (date), photo, notes
- Species (Espécies): id, name, commonName, description, careInstructions, idealConditions, photo
- Locations (Localizações): id, name, type (enum), sunlight (enum), humidity (enum), description, photo
- CareReminders (Lembretes): id, plantName/plantId, type (water/prune/fertilize), date, repeat (boolean/cron), note
- CareLogs (Registros): id, plantName/plantId, type, date, notes, photo

---

## Componentes e bibliotecas principais usadas (amostra)

- Bibliotecas: `react-native-paper`, `@expo/vector-icons`, `react-native-chart-kit`, `react-native-picker-select`, `react-native-mask-text`, `react-native-calendars`, `react-native-svg`, `expo-image-picker`, `axios`, `react-hook-form`, `zod`, `typeorm`, `@nestjs/*`
- Componentes React Native utilizados (exemplos): `TextInput`, `Button`, `Switch`, `Picker` (react-native-picker-select), `DateTimePicker`, `FlatList`, `ScrollView`, `Modal`, `Image`, `TouchableOpacity`, `ActivityIndicator`.

---

## Regras de negócio e validações

O backend contém mais de 15 regras de negócio espalhadas pelos Services e validadores customizados. Ex.:

- Validações de formato e limites (datas, horários, intervalos)
- Checagens de unicidade (nome de species/locations)
- Regras atômicas/transacionais para remoção de plantas e dependências (lembretes/logs)
- Validações de imagem (aceita data:image/* e URLs http(s))

Procure por essas regras em `backend/src/*/*.service.ts` e `backend/src/common/validators`.


## Estrutura de código (resumo)

- backend/
  - src/
	 - app/ (módulo principal)
	 - plants/ (lógica de plantas)
	 - species/ (espécies)
	 - locations/ (localizações)
	 - care-reminders/ (lembretes)
	 - care-logs/ (registros de cuidado)
	 - common/ (utilitários e validadores compartilhados)

- frontend/
  - app/
	 - screens/ (telas)

  - src/
	 - components/ (componentes reutilizáveis)
	 - services/ (chamada à API, mapeamento/normalização)
	 - hooks/ (hooks customizados)


---

## Licença

Este projeto está licenciado sob a licença presente no arquivo `LICENSE`.

---

## Contato

Rodrigo Martinhago Tachinski — rodrigomartinhago.contato@gmail.com
