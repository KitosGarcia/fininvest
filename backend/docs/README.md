# Fininvest: Plataforma Digital de Gestão de Microcrédito Coletivo

## Visão Geral

A Fininvest é uma plataforma web (backend implementado) desenvolvida para gerir de forma moderna, segura e transparente um fundo coletivo de microcrédito. Projetada para grupos de sócios que se unem com o objetivo de investir em microempréstimos a terceiros e entre si, a aplicação permite o controlo total das contribuições, operações de crédito, rentabilidade e histórico financeiro de cada membro.

Este repositório contém o código fonte do backend da aplicação, incluindo todas as funcionalidades avançadas de automação, geração de documentos, notificações e dashboards.

## Funcionalidades Implementadas (Backend API)

### Funcionalidades Base

*   **Autenticação:** Registo e Login de utilizadores (sócios/admin) com JWT.
*   **Gestão de Sócios:** CRUD (Create, Read, Update, Delete - soft delete) para sócios.
*   **Gestão de Clientes:** CRUD para clientes internos (ligados a sócios) e externos.
*   **Gestão de Empréstimos:**
    *   Submissão de pedidos de empréstimo.
    *   Aprovação/Rejeição de empréstimos (Admin).
    *   Geração automática de plano de amortização (simplificado) na aprovação.
    *   Registo automático de transação de desembolso na aprovação.
    *   Consulta de empréstimos e seus detalhes.
*   **Gestão de Contribuições (Quotas):**
    *   Registo de contribuições (Admin).
    *   Confirmação de contribuições com registo automático de transação no fundo.
    *   Consulta de contribuições.
*   **Gestão de Pagamentos de Empréstimos:**
    *   Registo de pagamentos recebidos (Admin).
    *   Registo automático de transação de entrada no fundo.
    *   Consulta de pagamentos associados a um empréstimo.
*   **Gestão de Transações do Fundo (Ledger):**
    *   Registo automático de transações (contribuições, desembolsos, pagamentos).
    *   Registo manual de transações (custos operacionais, outras receitas, etc. - Admin).
    *   Consulta de transações com filtros.
    *   Cálculo de saldo do fundo (simplificado).
*   **Segurança:** Autenticação baseada em JWT e autorização baseada em roles (admin/member) para endpoints específicos.

### Funcionalidades Avançadas

*   **Gestão Automatizada de Quotas:**
    *   Geração automática de quotas mensais para todos os sócios ativos.
    *   Verificação automática de quotas em atraso e notificação aos sócios.
    *   Geração de recibos PDF para pagamentos de quotas.
    *   Extrato detalhado da conta corrente do sócio.

*   **Gestão de Contas Bancárias:**
    *   Cadastro e gestão de múltiplas contas bancárias do fundo.
    *   Associação de transações a contas bancárias específicas.
    *   Transferências internas entre contas com registo e justificativo.
    *   Dashboard com saldo real por conta e saldo total do fundo.

*   **Documentos Personalizados:**
    *   Formulário e Contrato de Empréstimo em PDF.
    *   Termo de Adesão ao Fundo para novos sócios.
    *   Comprovativo de aprovação de crédito.
    *   Recibos de pagamento de quotas e parcelas.
    *   Justificativo de transferências internas.
    *   Extratos detalhados (sócio e empréstimo).

*   **Dashboards e Relatórios:**
    *   Painel de saldo por conta bancária.
    *   Dashboard de inadimplência.
    *   Relatório de rendimento acumulado do fundo e por sócio.
    *   Ranking de sócios mais ativos.

*   **Sistema de Notificações:**
    *   Notificações para pagamentos recebidos, quotas geradas, empréstimos aprovados.
    *   Alertas para prestações e quotas em atraso.
    *   Alertas internos para equipe de gestão (ex: saldo baixo em conta).
    *   Preparado para integração com serviços de email (placeholder implementado).

*   **Controlo Interno e Auditoria:**
    *   Logs detalhados de todas as ações no sistema.
    *   Histórico de alterações nos dados de clientes e sócios.
    *   Rastreabilidade completa de aprovações, pagamentos e modificações.

## Stack Tecnológica (Backend)

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Base de Dados:** PostgreSQL
*   **Autenticação:** JWT (jsonwebtoken), bcrypt
*   **ORM/Query Builder:** Node-postgres (pg)
*   **Geração de PDFs:** Python com FPDF2/WeasyPrint
*   **Outros:** dotenv, cors

## Estrutura do Projeto (Backend - /server)

```
/server
├── src
│   ├── config          # Configuração (db.js)
│   ├── controllers     # (Não implementado - lógica nas rotas por simplicidade)
│   ├── middleware      # Middlewares (authMiddleware.js)
│   ├── models          # Modelos de dados (interação com DB)
│   │   ├── auditLogModel.js
│   │   ├── bankAccountModel.js
│   │   ├── clientModel.js
│   │   ├── contributionModel.js
│   │   ├── fundTransactionModel.js
│   │   ├── internalTransferModel.js
│   │   ├── loanModel.js
│   │   ├── loanPaymentModel.js
│   │   ├── memberModel.js
│   │   ├── notificationModel.js
│   │   └── userModel.js
│   ├── routes          # Definição das rotas da API
│   │   ├── authRoutes.js
│   │   ├── automationRoutes.js
│   │   ├── bankAccountRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── contributionRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── fundTransactionRoutes.js
│   │   ├── internalTransferRoutes.js
│   │   ├── loanPaymentRoutes.js
│   │   ├── loanRoutes.js
│   │   └── memberRoutes.js
│   ├── services        # Serviços para lógica de negócio complexa
│   │   ├── auditLogService.js
│   │   ├── automationService.js
│   │   └── notificationService.js
│   ├── utils           # Utilitários e geradores de PDF
│   │   └── pdf_generators
│   │       ├── generate_credit_approval_proof.py
│   │       ├── generate_loan_contract.py
│   │       ├── generate_loan_payment_receipt.py
│   │       ├── generate_loan_statement.py
│   │       ├── generate_member_statement.py
│   │       ├── generate_membership_agreement.py
│   │       ├── generate_receipt.py
│   │       └── generate_transfer_proof.py
│   └── app.js          # Ponto de entrada principal da aplicação Express
├── .env              # Ficheiro de variáveis de ambiente (NÃO INCLUIR NO GIT)
├── .env.example      # Exemplo de variáveis de ambiente
└── package.json      # Dependências e scripts do projeto

/database
└── init.sql          # Script SQL para inicialização da base de dados

/docs
└── README.md         # Este ficheiro
```

## Pré-requisitos

*   Node.js (v14 ou superior recomendado)
*   npm (geralmente incluído com Node.js)
*   PostgreSQL (v12 ou superior recomendado)
*   Python 3.6+ (para geração de PDFs)
*   Bibliotecas Python: FPDF2, WeasyPrint

## Configuração e Instalação

1.  **Clonar o repositório (ou extrair o zip):**
    ```bash
    # git clone <repository_url>
    cd fininvest
    ```

2.  **Configurar a Base de Dados PostgreSQL:**
    *   Certifique-se que o PostgreSQL está instalado e em execução.
    *   Crie um utilizador e uma base de dados para a aplicação. Exemplo:
        ```sql
        CREATE DATABASE fininvest_db;
        CREATE USER fininvest_user WITH PASSWORD 'your_strong_password';
        GRANT ALL PRIVILEGES ON DATABASE fininvest_db TO fininvest_user;
        ```
    *   Execute o script de inicialização para criar as tabelas:
        ```bash
        psql -U fininvest_user -d fininvest_db -f database/init.sql
        ```

3.  **Configurar Variáveis de Ambiente (Backend):**
    *   Navegue até ao diretório `server`:
        ```bash
        cd server
        ```
    *   Copie o ficheiro de exemplo `.env.example` para `.env`:
        ```bash
        cp .env.example .env
        ```
    *   Edite o ficheiro `.env` com as suas configurações:
        ```dotenv
        # Server Configuration
        PORT=5000

        # Database Configuration (PostgreSQL)
        DB_USER=fininvest_user
        DB_PASSWORD=your_strong_password
        DB_HOST=localhost
        DB_PORT=5432
        DB_NAME=fininvest_db

        # JWT Configuration
        JWT_SECRET=your_very_strong_and_secret_jwt_key # Mude isto para algo seguro!
        JWT_EXPIRES_IN=1h
        
        # PDF Generation Configuration
        PDF_OUTPUT_DIR=./pdf_output
        ```

4.  **Instalar Dependências (Backend):**
    *   Ainda no diretório `server`, execute:
        ```bash
        npm install
        ```

5.  **Instalar Dependências Python (para geração de PDFs):**
    ```bash
    pip install fpdf2 weasyprint
    ```

## Execução

1.  **Iniciar o Servidor Backend:**
    *   No diretório `server`, execute:
        ```bash
        npm start
        ```
    *   Ou, para desenvolvimento com reinício automático (requer `nodemon` instalado globalmente ou como devDependency):
        ```bash
        npm run dev
        ```
    *   O servidor estará em execução em `http://localhost:5000` (ou a porta definida no `.env`).

## Endpoints da API (Exemplos)

### Endpoints Base

*   `POST /api/auth/register` - Registar novo utilizador
*   `POST /api/auth/login` - Login de utilizador (obtém token JWT)
*   `GET /api/members` - Listar todos os sócios (requer token)
*   `POST /api/members` - Criar novo sócio (requer token de admin)
*   `GET /api/clients` - Listar todos os clientes (requer token)
*   `POST /api/clients` - Criar novo cliente (requer token de admin)
*   `POST /api/loans/request` - Submeter pedido de empréstimo (requer token)
*   `PUT /api/loans/:id/approve` - Aprovar empréstimo (requer token de admin)
*   `GET /api/transactions/balance` - Obter saldo do fundo (requer token de admin)

### Endpoints Avançados

*   `POST /api/automation/generate-monthly-quotas` - Gerar quotas mensais para todos os sócios ativos
*   `POST /api/automation/check-overdue-quotas` - Verificar quotas em atraso e enviar notificações
*   `GET /api/bank-accounts` - Listar todas as contas bancárias
*   `POST /api/bank-accounts` - Criar nova conta bancária
*   `POST /api/internal-transfers` - Registar transferência entre contas bancárias
*   `GET /api/dashboard/bank-accounts-balance` - Obter saldo por conta bancária
*   `GET /api/dashboard/overdue-summary` - Obter resumo de inadimplência
*   `GET /api/members/:id/statement` - Gerar extrato de conta corrente do sócio (PDF)
*   `GET /api/loans/:id/contract` - Gerar contrato de empréstimo (PDF)
*   `GET /api/loans/:id/statement` - Gerar extrato do empréstimo (PDF)
*   `GET /api/contributions/:id/receipt` - Gerar recibo de pagamento de quota (PDF)
*   `GET /api/loan-payments/:id/receipt` - Gerar recibo de pagamento de parcela (PDF)

**Nota:** Para aceder a endpoints protegidos, inclua o token JWT no cabeçalho `Authorization` como `Bearer <token>`.

## Automação de Quotas e Notificações

A plataforma implementa um sistema de automação para gestão de quotas mensais e notificações, utilizando um mecanismo de gatilho externo. Isto permite que as tarefas periódicas sejam executadas sem depender de um agendador interno no servidor.

### Geração Mensal de Quotas

Para gerar automaticamente as quotas mensais para todos os sócios ativos, um serviço externo (como um cron job) deve chamar o endpoint:

```
POST /api/automation/generate-monthly-quotas
```

Com o seguinte payload:
```json
{
  "year": 2025,
  "month": 5
}
```

Este endpoint:
1. Verifica todos os sócios ativos
2. Gera registos de quotas devidas para cada sócio (se ainda não existirem)
3. Cria notificações para informar os sócios
4. Regista a ação nos logs de auditoria

### Verificação de Quotas em Atraso

Para verificar quotas em atraso e notificar os sócios, um serviço externo deve chamar o endpoint:

```
POST /api/automation/check-overdue-quotas
```

Com o seguinte payload (opcional):
```json
{
  "days_overdue": 5
}
```

Este endpoint:
1. Identifica quotas com status "due" e data de vencimento anterior ao limite definido
2. Atualiza o status dessas quotas para "overdue"
3. Cria notificações para os sócios com quotas em atraso
4. Regista a ação nos logs de auditoria

## Sistema de Notificações

O sistema de notificações está implementado com suporte para vários tipos de eventos:

* Geração de quotas
* Pagamentos recebidos
* Aprovação/rejeição de empréstimos
* Quotas e prestações em atraso
* Alertas de saldo baixo em contas bancárias

As notificações são armazenadas na base de dados e podem ser consultadas através da API. O sistema também inclui um placeholder para integração com serviços de email externos.

## Geração de Documentos PDF

A plataforma inclui um sistema robusto de geração de documentos PDF personalizados:

* **Recibos de Pagamento:** Para quotas e parcelas de empréstimos
* **Extratos:** Conta corrente do sócio e empréstimos
* **Contratos:** Empréstimos e termos de adesão
* **Comprovativos:** Aprovação de crédito e transferências internas

Os documentos são gerados utilizando Python com as bibliotecas FPDF2 e WeasyPrint, garantindo alta qualidade e personalização.

## Dashboards e Relatórios

A plataforma oferece endpoints para obtenção de dados agregados para dashboards:

* Saldo por conta bancária e saldo total do fundo
* Resumo de inadimplência (quotas e empréstimos)
* Rendimento acumulado do fundo e por sócio
* Ranking de sócios mais ativos

Estes dados podem ser facilmente consumidos por um frontend para criar visualizações ricas e informativas.

## Logs de Auditoria e Controlo Interno

Todas as ações importantes no sistema são registadas em logs de auditoria detalhados, incluindo:

* Quem realizou a ação
* Quando foi realizada
* Detalhes específicos da ação
* Entidade afetada

Isto garante total rastreabilidade e transparência nas operações do fundo.

## Frontend / App Mobile

O frontend e a aplicação mobile não foram implementados neste projeto. A API backend está pronta para ser consumida por um cliente web (React, Vue, Angular, etc.) ou mobile (React Native, Flutter, Swift, Kotlin).

## Próximos Passos / Melhorias

*   Implementar o frontend web com dashboards interativos.
*   Implementar a app mobile (ou PWA) para acesso em qualquer lugar.
*   Adicionar testes unitários e de integração mais robustos.
*   Implementar integração real com serviços de email para notificações.
*   Adicionar suporte para assinaturas digitais em contratos.
*   Implementar uploads seguros de ficheiros para comprovativos e documentos.
*   Considerar funcionalidades futuras como integração com gateways de pagamento, scoring de crédito, etc.

