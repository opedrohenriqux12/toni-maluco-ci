# Diretrizes de Engenharia e Operação - Claude & ToniMaluco C.I

## 1. Commit e Deploy Automático Obrigatório
- **Regra Fundamental**: Toda e qualquer alteração de código, criação de arquivos ou refatoração concluída e verificada com TypeScript (`npx tsc --noEmit`) **DEVE** gerar automaticamente um novo commit limpo (`git add .` e `git commit -m "..."`) e ser enviada imediatamente para o GitHub (`git push origin main`).
- Não aguardar solicitação do usuário para commitar e dar push: a entrega de cada tarefa só é considerada completa após o código estar commitado e enviado para a Vercel atualizar.

## 2. Preservação de Histórico (Lovable)
- Nunca fazer force push (`git push -f`) ou rebase/amend de commits já publicados.
- Manter a branch `main` sempre compilando sem erros (código de saída 0).

## 3. Padrões de Código
- TypeScript estrito, design system consistente (tema escuro com glassmorphism, ciano primário, padrões pt-BR).
