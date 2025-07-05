#!/bin/bash

echo "Mensagem do commit:"
read msg

# Garante que node_modules e ficheiros grandes sejam removidos do tracking
git rm -r --cached node_modules/ .local-chromium/ 2>/dev/null

# Adiciona apenas os ficheiros válidos (excluindo ignorados)
git add -u

git commit -m "$msg"
git push origin main
