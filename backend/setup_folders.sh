#!/bin/bash

echo "🔧 Criar estrutura de migrations e modelos..."

# Garantir que estamos no diretório raiz do backend
cd "$(dirname "$0")"

# Criar estrutura de pastas se não existir
mkdir -p src/models
mkdir -p src/controllers
mkdir -p src/routes
mkdir -p migrations

echo "✅ Estrutura criada: src/models, src/controllers, src/routes, migrations"
