# 🧪 GUIA DE TESTES - WA Multi Melhorado

## 🚀 Como Executar

```bash
# Certifique-se de estar na pasta do projeto
cd C:\Users\manin\Downloads\Monitoramento-Whats

# Execute o aplicativo
npm start
```

---

## ✅ CHECKLIST DE TESTES

### **1. Inicialização** ⏱️ 1 min

- [ ] App abre sem erros
- [ ] Interface melhorada carregada (botões com ícones)
- [ ] 2 sessões padrão (A e B) aparecem
- [ ] Toast de "WA Multi carregado com sucesso!" aparece
- [ ] Console mostra logs estruturados

**Como testar:**
1. Abra o app
2. Observe a interface
3. Pressione F12 para ver console
4. Veja os logs com timestamps

---

### **2. Renomear Sessões** ⏱️ 2 min

- [ ] Click no título "WA A" mostra input
- [ ] Digite "Vendas" e pressione Enter
- [ ] Título muda para "Vendas"
- [ ] Toast confirma "Sessão renomeada"
- [ ] Fechar app e reabrir mantém o nome

**Como testar:**
1. Clique em "WA A"
2. Digite "Vendas"
3. Pressione Enter
4. Veja toast de confirmação
5. Feche e reabra o app
6. Verifique se "Vendas" permaneceu

---

### **3. Tema Claro/Escuro** ⏱️ 1 min

- [ ] Tema escuro ativo por padrão
- [ ] Click em "🌓 Tema" alterna para claro
- [ ] Todas cores mudam suavemente
- [ ] Toast confirma tema ativo
- [ ] Tema salvo após fechar/reabrir

**Como testar:**
1. Observe tema escuro inicial
2. Clique no botão "🌓 Tema"
3. Veja transição suave para tema claro
4. Clique novamente para voltar ao escuro
5. Feche e reabra - tema deve persistir

---

### **4. Atalhos de Teclado** ⏱️ 3 min

- [ ] **Ctrl+N** → Cria nova sessão
- [ ] **Del** → Abre confirmação de remoção
- [ ] **F11** → Maximiza sessão selecionada
- [ ] **Esc** → Restaura grade
- [ ] **Ctrl++** → Aumenta zoom
- [ ] **Ctrl+-** → Diminui zoom
- [ ] **Ctrl+0** → Reseta zoom para 100%
- [ ] **F5** → Recarrega sessão

**Como testar:**
1. Selecione uma sessão (clique nela)
2. Teste cada atalho sequencialmente
3. Observe feedback visual
4. Veja toasts de confirmação

---

### **5. Adicionar/Remover Sessões** ⏱️ 2 min

- [ ] Click "+" adiciona sessão C
- [ ] Toast confirma "Sessão adicionada"
- [ ] Selecione sessão C
- [ ] Click "Remover" mostra modal de confirmação
- [ ] "Cancelar" fecha modal sem remover
- [ ] "Confirmar" remove sessão
- [ ] Toast confirma remoção

**Como testar:**
1. Clique "+ Adicionar" (ou Ctrl+N)
2. Veja sessão C aparecer
3. Clique nela para selecionar
4. Clique "Remover" (ou Del)
5. Veja modal de confirmação
6. Clique "Cancelar" - nada acontece
7. Clique "Remover" novamente
8. Clique "Confirmar" - sessão removida

---

### **6. Zoom** ⏱️ 2 min

- [ ] Botões +/- funcionam
- [ ] Campo de zoom manual aceita valores
- [ ] Zoom limitado a 30-300%
- [ ] Label atualiza em tempo real
- [ ] Zoom salvo após fechar/reabrir

**Como testar:**
1. Selecione uma sessão
2. Clique "−" várias vezes
3. Observe WhatsApp diminuindo
4. Clique "+" para aumentar
5. Digite "150" no campo de zoom
6. Veja label mostrar (150%)
7. Feche e reabra - zoom deve persistir

---

### **7. Maximizar/Restaurar** ⏱️ 1 min

- [ ] "⛶ Maximizar" expande sessão selecionada
- [ ] Sessão ocupa tela toda
- [ ] "⊡ Restaurar" volta ao grid
- [ ] F11 também maximiza
- [ ] Esc também restaura

**Como testar:**
1. Selecione uma sessão
2. Clique "⛶ Maximizar" (ou F11)
3. Veja sessão expandir
4. Clique "⊡ Restaurar" (ou Esc)
5. Veja grade restaurada

---

### **8. Loading Indicators** ⏱️ 1 min

- [ ] Spinner aparece ao carregar WhatsApp
- [ ] Spinner some quando página carrega
- [ ] Click "↻ Reload" mostra spinner novamente

**Como testar:**
1. Adicione nova sessão
2. Observe spinner girando
3. Aguarde WhatsApp carregar
4. Spinner desaparece
5. Clique "↻ Reload"
6. Spinner aparece novamente

---

### **9. Exportar Configurações** ⏱️ 2 min

- [ ] Click "⤓ Exportar" abre dialog
- [ ] Arquivo sugere nome com timestamp
- [ ] Salvar cria arquivo JSON
- [ ] Arquivo contém IDs, zoom, names, theme
- [ ] Toast confirma exportação

**Como testar:**
1. Renomeie algumas sessões
2. Ajuste alguns zooms
3. Clique "⤓ Exportar"
4. Escolha local (Desktop)
5. Salve
6. Veja toast de confirmação
7. Abra arquivo JSON em editor
8. Verifique conteúdo

---

### **10. Importar Configurações** ⏱️ 2 min

- [ ] Click "⤒ Importar" abre confirmação
- [ ] "Cancelar" fecha modal
- [ ] "Confirmar" abre dialog de arquivo
- [ ] Selecionar JSON importa dados
- [ ] Interface atualiza com dados importados
- [ ] Toast confirma importação

**Como testar:**
1. Clique "⤒ Importar"
2. Veja modal de confirmação
3. Clique "Confirmar"
4. Selecione arquivo JSON exportado
5. Veja interface atualizar
6. Verifique nomes/zooms importados

---

### **11. Menu da Aplicação** ⏱️ 2 min

- [ ] Menu "Arquivo" tem 4 opções
- [ ] Menu "Exibir" tem 4 opções
- [ ] Menu "Zoom" tem 3 opções
- [ ] Menu "Ajuda" tem 3 opções
- [ ] Todos itens funcionam
- [ ] Atalhos mostrados ao lado

**Como testar:**
1. Clique em "Arquivo"
2. Teste "Nova Sessão" (Ctrl+N)
3. Clique em "Exibir"
4. Teste "Alternar DevTools" (F12)
5. Clique em "Ajuda"
6. Teste "Sobre"
7. Veja dialog com versões

---

### **12. Pasta de Dados** ⏱️ 1 min

- [ ] Menu > Ajuda > "Abrir Pasta de Dados"
- [ ] Explorador abre pasta correta
- [ ] Arquivo `state.json` existe
- [ ] Arquivo `window-state.json` existe

**Como testar:**
1. Menu > Ajuda > Abrir Pasta de Dados
2. Explorador abre
3. Veja arquivos JSON
4. Feche explorador

---

### **13. Backup Automático** ⏱️ 2 min

- [ ] Menu > Ajuda > "Abrir Pasta de Backups"
- [ ] Pasta existe (data/backups)
- [ ] Arquivos `state-{timestamp}.json` existem
- [ ] Adicionar sessão cria novo backup
- [ ] Máximo 10 backups mantidos

**Como testar:**
1. Menu > Ajuda > Abrir Pasta de Backups
2. Veja arquivos existentes
3. Anote quantidade
4. Adicione nova sessão
5. Atualize pasta (F5)
6. Veja novo backup criado
7. Abra arquivo - veja estrutura JSON

---

### **14. Estado da Janela** ⏱️ 2 min

- [ ] Redimensionar janela salva tamanho
- [ ] Mover janela salva posição
- [ ] Maximizar salva estado
- [ ] Fechar e reabrir restaura tudo

**Como testar:**
1. Redimensione janela
2. Mova para outro local
3. Feche app
4. Reabra app
5. Janela volta na mesma posição/tamanho
6. Maximize janela
7. Feche e reabra
8. Janela abre maximizada

---

### **15. Toast Notifications** ⏱️ 1 min

- [ ] Toasts aparecem canto inferior direito
- [ ] Desaparecem após 3 segundos
- [ ] Success = borda verde
- [ ] Warning = borda laranja
- [ ] Error = borda vermelha
- [ ] Animação suave

**Como testar:**
1. Adicione sessão - veja toast success
2. Clique remover sem selecionar - veja warning
3. Observe cores e animações
4. Aguarde 3s - toast desaparece

---

### **16. Modal de Atalhos** ⏱️ 1 min

- [ ] Click "ℹ️ Atalhos" abre modal
- [ ] Lista todos atalhos
- [ ] Click "Fechar" fecha modal
- [ ] Click fora fecha modal
- [ ] Esc fecha modal

**Como testar:**
1. Clique em "ℹ️ Atalhos"
2. Veja modal com tabela
3. Leia lista de atalhos
4. Clique "Fechar"
5. Abra novamente
6. Clique fora do modal - fecha
7. Abra novamente
8. Pressione Esc - fecha

---

### **17. Seleção de Sessão** ⏱️ 1 min

- [ ] Click em tile seleciona sessão
- [ ] Borda azul aparece
- [ ] Scroll automático se necessário
- [ ] Botões afetam sessão selecionada

**Como testar:**
1. Clique em diferentes tiles
2. Observe borda azul mudando
3. Teste botões (zoom, reload)
4. Confirme que afeta sessão correta

---

### **18. Tema Responsivo** ⏱️ 1 min

- [ ] Redimensionar janela adapta grid
- [ ] Tiles se reorganizam
- [ ] Breakpoint mobile funciona
- [ ] Scrollbar aparece quando necessário

**Como testar:**
1. Redimensione janela (estreita)
2. Veja grid mudar para 1 coluna
3. Alargue janela
4. Veja múltiplas colunas
5. Adicione muitas sessões
6. Veja scrollbar

---

### **19. DevTools** ⏱️ 1 min

- [ ] F12 abre DevTools
- [ ] Console mostra logs estruturados
- [ ] Network mostra requisições
- [ ] Sem erros no console

**Como testar:**
1. Pressione F12
2. Vá para aba Console
3. Veja logs com timestamps
4. Procure por erros (não deve ter)
5. Vá para aba Network
6. Veja requisições do WhatsApp

---

### **20. Performance** ⏱️ 2 min

- [ ] Interface responde rapidamente
- [ ] Sem lag ao alternar temas
- [ ] Zoom aplica instantaneamente
- [ ] Renderização suave

**Como testar:**
1. Adicione 5+ sessões
2. Alterne tema várias vezes
3. Maximize e restaure rapidamente
4. Ajuste zoom de várias sessões
5. Observe fluidez

---

## 📊 RESUMO DOS TESTES

```
Total de Testes:     20 categorias
Tempo Estimado:      30-35 minutos
Nível:               ⭐⭐⭐ Intermediário
Pré-requisitos:      Node.js instalado
```

---

## ✅ CHECKLIST RÁPIDO

```
[ ] 1.  Inicialização
[ ] 2.  Renomear Sessões
[ ] 3.  Tema Claro/Escuro
[ ] 4.  Atalhos de Teclado
[ ] 5.  Adicionar/Remover
[ ] 6.  Zoom
[ ] 7.  Maximizar/Restaurar
[ ] 8.  Loading Indicators
[ ] 9.  Exportar
[ ] 10. Importar
[ ] 11. Menu
[ ] 12. Pasta de Dados
[ ] 13. Backup Automático
[ ] 14. Estado da Janela
[ ] 15. Toast Notifications
[ ] 16. Modal de Atalhos
[ ] 17. Seleção
[ ] 18. Responsivo
[ ] 19. DevTools
[ ] 20. Performance
```

---

## 🐛 REPORTAR PROBLEMAS

Se encontrar bugs:

1. Pressione F12 (DevTools)
2. Copie mensagens de erro do console
3. Anote passos para reproduzir
4. Verifique pasta de logs

---

## 🎉 CONCLUSÃO

Após completar todos os testes, você terá validado:

✅ Todas novas funcionalidades
✅ Interface melhorada
✅ Segurança aprimorada
✅ Performance otimizada
✅ UX profissional

**Bons testes!** 🚀


