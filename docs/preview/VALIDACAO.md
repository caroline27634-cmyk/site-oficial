# Prévia para aprovação — sem publicação

Build de produção concluído; lint, TypeScript e testes de esquemas aprovados.

Chromium: navegação das páginas, retorno ao início, destaque do menu, seleção de serviço/pacote, resumo persistido somente na aba, cópia e limpeza do resumo, ausência de requisição de registro sem consentimento, manutenção das imagens anteriores, filtros, modal com teclado, menu móvel e ausência de rolagem horizontal em 320, 390, 768 e 1024 px. Nenhum erro JavaScript detectado.

Acesso anônimo a `/admin` e `/admin/marketing` redireciona para a página de acesso. Sem Supabase configurado, ela não apresenta um login fictício. A API recusa dados sem consentimento e origens diferentes; responde indisponibilidade real quando o banco não está configurado.

Capturas geradas pelo navegador com redução de movimento para não capturar animações pela metade:

- `inicio-desktop.png`
- `inicio-mobile.png`
- `pacotes-desktop.png`
- `confirmacao-desktop.png` (dados exclusivamente de teste)

A prévia funcional permanece no processo local iniciado com `npm start -- --port 3001`. Processos não sobrevivem à troca de ambiente; reinicie usando as instruções do README se necessário. Não existe URL pública de produção ou deploy de prévia criado nesta etapa.

Pendente: criar/configurar Supabase, executar a migração e testar autenticação administrativa real, RLS, Storage e persistência de conteúdo, marketing e pedidos. Campos de links sociais estão vazios até o cadastro dos canais oficiais. As APIs da Meta não estão conectadas; planejamento e compartilhamento são manuais.

Nenhuma campanha, mensagem, push Git ou publicação de produção foi realizada.
