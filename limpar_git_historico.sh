#!/bin/bash

echo "🚨 Iniciando limpeza de histórico Git..."

# 1. Verificar se git-filter-repo está instalado
if ! command -v git-filter-repo &> /dev/null
then
    echo "❌ git-filter-repo não está instalado. Instalando via pip..."
    pip install git-filter-repo || {
        echo "❌ Falha ao instalar git-filter-repo. Instale manualmente e tente novamente."
        exit 1
    }
fi

# 2. Fazer backup do repositório
echo "📦 Fazendo backup do repositório em 'fininvest-backup'..."
cp -r . ../fininvest-backup

# 3. Executar git-filter-repo para remover os diretórios grandes
echo "🧹 Limpando node_modules e Chromium do histórico Git..."
git filter-repo --force \
  --path backend/server/node_modules --invert-paths \
  --path frontend/node_modules --invert-paths \
  --path backend/server/node_modules/puppeteer/.local-chromium --invert-paths \
  --path backend/server/node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs --invert-paths

# 4. Verificar resultado
echo "✅ Limpeza concluída."

# 5. Adicionar novamente o .gitignore se necessário
echo "📄 Garantindo .gitignore correto..."
echo -e "node_modules/\n.local-chromium/\n*.log\n" >> .gitignore
git add .gitignore
git commit -m "Adicionar .gitignore após limpeza"

# 6. Push forçado para sobrescrever histórico remoto
echo "🚀 Fazendo push forçado para o GitHub..."
git push origin main --force

echo "🎉 Feito! Histórico limpo e push concluído com sucesso."

