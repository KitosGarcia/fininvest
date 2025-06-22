# Guia de Instalação e Utilização - Fininvest Frontend

Este documento fornece instruções detalhadas para instalar, configurar e utilizar o frontend da aplicação Fininvest, garantindo a integração completa com o backend.

## 1. Requisitos do Sistema

- Node.js 16.x ou superior
- pnpm 7.x ou superior
- Backend Fininvest em execução (ver instruções separadas para o backend)

## 2. Instalação

### 2.1 Clonar o Repositório

```bash
git clone [URL_DO_REPOSITORIO]
cd fininvest-frontend
```

### 2.2 Instalar Dependências

```bash
pnpm install
```

### 2.3 Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```
VITE_API_URL=http://localhost:5000/api
```

> **Nota:** Substitua a URL acima pelo endereço onde o backend está em execução.

## 3. Execução

### 3.1 Ambiente de Desenvolvimento

```bash
pnpm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

### 3.2 Compilação para Produção

```bash
pnpm run build
```

Os arquivos compilados serão gerados na pasta `dist`.

### 3.3 Execução em Produção

Após compilar, você pode servir os arquivos estáticos usando um servidor web como Nginx, Apache ou usar:

```bash
pnpm run preview
```

## 4. Integração com o Backend

### 4.1 Configuração da API

O frontend está configurado para se comunicar com o backend através dos serviços definidos em `src/services/api.ts`. Todos os endpoints necessários já estão mapeados e prontos para uso.

### 4.2 Autenticação

A autenticação é gerenciada pelo serviço `authService`, que:
- Armazena o token JWT no localStorage
- Adiciona o token a todas as requisições
- Redireciona para a página de login quando o token expira

### 4.3 Tratamento de Erros

O sistema inclui tratamento global de erros que:
- Exibe feedback visual para o usuário
- Lida com erros de autenticação automaticamente
- Fornece mensagens específicas para diferentes tipos de erro

## 5. Guia de Utilização

### 5.1 Login

- Acesse a aplicação em `http://localhost:5173`
- Insira suas credenciais (email e senha)
- Clique em "Entrar"

### 5.2 Dashboard

O dashboard principal exibe:
- Estatísticas gerais (sócios, empréstimos, contribuições, saldo)
- Gráfico de desempenho financeiro (com seleção de período)
- Gráfico de status dos empréstimos
- Lista de atividades recentes
- Alertas do sistema

### 5.3 Gestão de Sócios

- **Listar Sócios:** Acesse "Sócios" no menu lateral
- **Criar Sócio:** Clique em "Novo Sócio" e preencha o formulário
- **Editar Sócio:** Clique no ícone de edição na linha do sócio
- **Ver Detalhes:** Clique no nome do sócio
- **Excluir Sócio:** Clique no ícone de exclusão na linha do sócio
- **Gerar Documentos:** Na página de detalhes, use as opções disponíveis

### 5.4 Gestão de Clientes

- **Listar Clientes:** Acesse "Clientes" no menu lateral
- **Criar Cliente:** Clique em "Novo Cliente" e preencha o formulário
- **Editar Cliente:** Clique no ícone de edição na linha do cliente
- **Ver Detalhes:** Clique no nome do cliente
- **Excluir Cliente:** Clique no ícone de exclusão na linha do cliente

### 5.5 Gestão de Empréstimos

- **Listar Empréstimos:** Acesse "Empréstimos" no menu lateral
- **Criar Empréstimo:** Clique em "Novo Empréstimo" e preencha o formulário
- **Aprovar Empréstimo:** Clique no ícone de aprovação na linha do empréstimo
- **Rejeitar Empréstimo:** Clique no ícone de rejeição na linha do empréstimo
- **Ver Detalhes:** Clique no ID do empréstimo
- **Gerar Documentos:** Na página de detalhes, use as opções disponíveis

### 5.6 Gestão de Contribuições

- **Listar Contribuições:** Acesse "Contribuições" no menu lateral
- **Criar Contribuição:** Clique em "Nova Contribuição" e preencha o formulário
- **Confirmar Pagamento:** Clique no ícone de edição na linha da contribuição
- **Ver Detalhes:** Clique no ID da contribuição
- **Ver Recibo:** Clique no ícone de recibo na linha da contribuição

### 5.7 Gestão de Contas Bancárias

- **Listar Contas:** Acesse "Contas Bancárias" no menu lateral
- **Criar Conta:** Clique em "Nova Conta" e preencha o formulário
- **Editar Conta:** Clique no ícone de edição na linha da conta
- **Ver Detalhes:** Clique no nome do banco
- **Excluir Conta:** Clique no ícone de exclusão na linha da conta

### 5.8 Gestão de Transferências

- **Listar Transferências:** Acesse "Transferências" no menu lateral
- **Criar Transferência:** Clique em "Nova Transferência" e preencha o formulário
- **Ver Detalhes:** Clique na referência da transferência
- **Ver Comprovante:** Clique no ícone de comprovante na linha da transferência

### 5.9 Automação

- **Acessar Painel:** Acesse "Automação" no menu lateral
- **Gerar Quotas Mensais:** Selecione ano e mês, clique em "Gerar Quotas"
- **Verificar Quotas em Atraso:** Defina dias de atraso, clique em "Verificar Atrasos"

### 5.10 Relatórios

- **Acessar Painel:** Acesse "Relatórios" no menu lateral
- **Selecionar Tipo:** Escolha entre Financeiro, Empréstimos ou Sócios
- **Definir Período:** Selecione o período desejado
- **Exportar:** Clique em "Exportar PDF" ou "Exportar Excel"

## 6. Responsividade

A interface foi projetada para funcionar em diferentes dispositivos:

- **Desktop:** Layout completo com menu lateral expandido
- **Tablet:** Menu lateral colapsável, layout adaptado
- **Mobile:** Menu hamburger, layout em coluna única

## 7. Solução de Problemas

### 7.1 Problemas de Autenticação

- Verifique se o backend está em execução
- Limpe o localStorage do navegador
- Verifique se a URL da API está correta no arquivo `.env`

### 7.2 Dados Não Carregam

- Verifique o console do navegador para erros
- Confirme que o backend está respondendo corretamente
- Verifique se o token JWT é válido

### 7.3 Erros de Compilação

- Execute `pnpm install` para garantir que todas as dependências estão instaladas
- Verifique se há erros de TypeScript no código
- Limpe a cache com `pnpm clean`

## 8. Customização

### 8.1 Tema

O tema da aplicação pode ser customizado no arquivo `tailwind.config.js`:

- Cores primárias e secundárias
- Fontes
- Bordas e sombras

### 8.2 Layout

O layout principal pode ser ajustado em `src/components/layout/MainLayout.tsx`.

## 9. Segurança

- Todos os dados sensíveis são transmitidos via HTTPS
- Tokens JWT são armazenados no localStorage
- Todas as rotas sensíveis são protegidas
- Validação de entrada em todos os formulários

## 10. Suporte

Para suporte técnico ou dúvidas sobre a aplicação, entre em contato:

- Email: suporte@fininvest.com
- Telefone: (00) 1234-5678
