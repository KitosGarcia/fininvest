#!/bin/bash

# Script de Correção da Navegação - Fininvest Frontend
# Este script corrige o problema de navegação para as páginas da aplicação

echo "🔧 Iniciando correção da navegação da aplicação Fininvest..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto fininvest-frontend"
    exit 1
fi

echo "📁 Diretório correto identificado"

# Backup dos arquivos que serão modificados
echo "💾 Criando backup dos arquivos..."
BACKUP_DIR="backup_navegacao_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

cp src/App.tsx $BACKUP_DIR/ 2>/dev/null || echo "App.tsx não encontrado"
cp src/components/members/MemberList.tsx $BACKUP_DIR/ 2>/dev/null || echo "MemberList.tsx não encontrado"
cp src/components/clients/ClientList.tsx $BACKUP_DIR/ 2>/dev/null || echo "ClientList.tsx não encontrado"

echo "✅ Backup criado em: $BACKUP_DIR"

echo "🔧 Aplicando correções de navegação..."

# 1. Corrigir rotas no App.tsx para corresponder aos caminhos do Sidebar
echo "  - Corrigindo rotas no App.tsx..."

# Substituir /members por /socios
sed -i 's|path="/members"|path="/socios"|g' src/App.tsx

# Substituir /clients por /clientes  
sed -i 's|path="/clients"|path="/clientes"|g' src/App.tsx

# Substituir /loans por /emprestimos
sed -i 's|path="/loans"|path="/emprestimos"|g' src/App.tsx

# Substituir /contributions por /contribuicoes
sed -i 's|path="/contributions"|path="/contribuicoes"|g' src/App.tsx

# Substituir /bank-accounts por /contas
sed -i 's|path="/bank-accounts"|path="/contas"|g' src/App.tsx

# Substituir /transfers por /transferencias
sed -i 's|path="/transfers"|path="/transferencias"|g' src/App.tsx

# Substituir /automation por /automacao
sed -i 's|path="/automation"|path="/automacao"|g' src/App.tsx

# Substituir /reports por /relatorios
sed -i 's|path="/reports"|path="/relatorios"|g' src/App.tsx

# Adicionar rota para configurações se não existir
if ! grep -q 'path="/configuracoes"' src/App.tsx; then
    # Adicionar rota de configurações antes da rota catch-all
    sed -i '/\/\* Redirecionar para o dashboard se a rota não existir \*\//i\
        {/* Rotas de Configurações */}\
        <Route path="/configuracoes" element={\
          <ProtectedRoute>\
            <MainLayout>\
              <div className="p-6">\
                <h1 className="text-2xl font-bold mb-4">Configurações</h1>\
                <p className="text-muted-foreground">Página de configurações em desenvolvimento.</p>\
              </div>\
            </MainLayout>\
          </ProtectedRoute>\
        } />\
        ' src/App.tsx
fi

# 2. Corrigir importações do React nos componentes
echo "  - Corrigindo importações do React nos componentes..."

# Corrigir MemberList.tsx
if ! grep -q "import React" src/components/members/MemberList.tsx; then
    sed -i '1i import React, { useState, useEffect } from '\''react'\'';\' src/components/members/MemberList.tsx
    # Remover linha duplicada se existir
    sed -i '/^import { useState, useEffect } from '\''react'\'';$/d' src/components/members/MemberList.tsx
fi

# Corrigir ClientList.tsx
if ! grep -q "import React" src/components/clients/ClientList.tsx; then
    sed -i '1i import React, { useState, useEffect } from '\''react'\'';\' src/components/clients/ClientList.tsx
    # Remover linha duplicada se existir
    sed -i '/^import { useState, useEffect } from '\''react'\'';$/d' src/components/clients/ClientList.tsx
fi

# Corrigir LoanList.tsx
if [ -f "src/components/loans/LoanList.tsx" ] && ! grep -q "import React" src/components/loans/LoanList.tsx; then
    sed -i '1i import React, { useState, useEffect } from '\''react'\'';\' src/components/loans/LoanList.tsx
    sed -i '/^import { useState, useEffect } from '\''react'\'';$/d' src/components/loans/LoanList.tsx
fi

# Corrigir ContributionList.tsx
if [ -f "src/components/contributions/ContributionList.tsx" ] && ! grep -q "import React" src/components/contributions/ContributionList.tsx; then
    sed -i '1i import React, { useState, useEffect } from '\''react'\'';\' src/components/contributions/ContributionList.tsx
    sed -i '/^import { useState, useEffect } from '\''react'\'';$/d' src/components/contributions/ContributionList.tsx
fi

# Corrigir BankAccountList.tsx
if [ -f "src/components/bank-accounts/BankAccountList.tsx" ] && ! grep -q "import React" src/components/bank-accounts/BankAccountList.tsx; then
    sed -i '1i import React, { useState, useEffect } from '\''react'\'';\' src/components/bank-accounts/BankAccountList.tsx
    sed -i '/^import { useState, useEffect } from '\''react'\'';$/d' src/components/bank-accounts/BankAccountList.tsx
fi

# Corrigir TransferList.tsx
if [ -f "src/components/transfers/TransferList.tsx" ] && ! grep -q "import React" src/components/transfers/TransferList.tsx; then
    sed -i '1i import React, { useState, useEffect } from '\''react'\'';\' src/components/transfers/TransferList.tsx
    sed -i '/^import { useState, useEffect } from '\''react'\'';$/d' src/components/transfers/TransferList.tsx
fi

# Corrigir AutomationPanel.tsx
if [ -f "src/components/automation/AutomationPanel.tsx" ] && ! grep -q "import React" src/components/automation/AutomationPanel.tsx; then
    sed -i '1i import React, { useState, useEffect } from '\''react'\'';\' src/components/automation/AutomationPanel.tsx
    sed -i '/^import { useState, useEffect } from '\''react'\'';$/d' src/components/automation/AutomationPanel.tsx
fi

# Corrigir ReportsPanel.tsx
if [ -f "src/components/reports/ReportsPanel.tsx" ] && ! grep -q "import React" src/components/reports/ReportsPanel.tsx; then
    sed -i '1i import React, { useState, useEffect } from '\''react'\'';\' src/components/reports/ReportsPanel.tsx
    sed -i '/^import { useState, useEffect } from '\''react'\'';$/d' src/components/reports/ReportsPanel.tsx
fi

echo "✅ Correções de navegação aplicadas com sucesso!"

echo ""
echo "🎉 Correção da navegação concluída!"
echo ""
echo "📋 Resumo das correções aplicadas:"
echo "  ✅ Rotas corrigidas para corresponder aos caminhos do menu:"
echo "    - /socios (Sócios)"
echo "    - /clientes (Clientes)"
echo "    - /emprestimos (Empréstimos)"
echo "    - /contribuicoes (Contribuições)"
echo "    - /contas (Contas Bancárias)"
echo "    - /transferencias (Transferências)"
echo "    - /relatorios (Relatórios)"
echo "    - /configuracoes (Configurações)"
echo "  ✅ Importações do React corrigidas em todos os componentes"
echo "  ✅ Rota de configurações adicionada"
echo ""
echo "🚀 Para aplicar as correções, reinicie o servidor:"
echo "   pnpm run dev"
echo ""
echo "💾 Backup dos arquivos originais salvo em: $BACKUP_DIR"
echo ""
echo "🔗 Agora a navegação deve funcionar corretamente:"
echo "  - Clique em 'Sócios' deve abrir a página de sócios"
echo "  - Clique em 'Clientes' deve abrir a página de clientes"
echo "  - Todas as outras páginas do menu devem funcionar"
echo "  - URLs correspondem aos nomes em português do menu"

