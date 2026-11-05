# Encanto no Retrato Studio IA

Site Next.js 16 / React 19 / TypeScript / Tailwind CSS 4, com identidade rosa, creme e dourado. Desenvolvimento local sem publicação automática.

## Executar e verificar

Node.js 24 e npm:

```sh
npm ci
npm run dev
# Verificação de produção:
npm run lint
npm run build
npm run typecheck
npm start
```

Use somente um servidor por porta. O Next.js precisa criar processos e portas locais durante o build; no ambiente restrito, autorize essa capacidade pelo mecanismo da ferramenta. Quando necessário, use o proxy HTTPS já fornecido no ambiente para a instalação (`npm ci --proxy "$HTTPS_PROXY"`). Não desative verificação TLS.

## Páginas

- `/`: banner do estúdio, apresentação breve e serviços em destaque.
- `/quem-somos`: instituição, missão e explicação sobre ensaios virtuais.
- `/nossos-servicos`: seis serviços com imagens demonstrativas e botões de seleção.
- `/precos-e-pacotes`: 1 foto por R$ 2,50; 5 por R$ 10; 10 por R$ 20, editáveis no painel conectado.
- `/galeria`: temas, categorias, ampliação com Escape e setas; preserva as seis imagens anteriores.
- `/como-funciona`: contratação, envio privado, criação e entrega.
- `/contato`: nome, serviço, pacote e tema. Apenas Messenger e Instagram Direct para atendimento. Sem e-mail, telefone, endereço ou WhatsApp.
- `/contato/confirmacao`: resumo copiável e canais oficiais. Sem links cadastrados, os botões explicam a indisponibilidade e ficam desativados.
- `/admin`: painel privado de conteúdo, galeria, categorias, serviços, preços, redes e últimos 100 pedidos autorizados.
- `/admin/marketing`: Central de Divulgação privada.
- `/privacidade`: uso de dados e imagens.

`/sobre` redireciona para `/quem-somos`. Publicações anteriores continuam em `/publicacoes` e suas URLs originais. Nenhum arquivo da galeria anterior foi removido. As versões antigas do início e de Sobre foram preservadas em `docs/*-anterior.tsx.txt`.

## Escolha de serviços e pedidos

Botões de serviços e pacotes preenchem a seleção no contato. O resumo só fica no `sessionStorage` da aba; pode ser apagado na confirmação. Nenhum dado é transmitido para redes sociais automaticamente. O cliente copia e envia a mensagem por decisão própria.

O registro no banco é **opcional**, somente com consentimento. O endpoint valida dados, origem, tamanho e campo antirrobô. A função SQL limita duplicatas em cinco minutos e o volume global a 100 registros/hora. Se o registro falhar, a interface informa e permite tentar novamente ou continuar sem autorizar envio. Não há resposta de sucesso simulada. Não há pagamento nem contratação automática.

Sem Supabase, as páginas públicas usam o conteúdo local e o resumo funciona normalmente, mas o painel e o registro de pedidos ficam indisponíveis. Não há login de demonstração ou armazenamento privado em arquivos públicos.

## Configurar Supabase (ainda não configurado neste ambiente)

1. Crie um projeto Supabase. No SQL Editor, execute `supabase/schema.sql` **uma vez**. A migração é transacional; não apaga conteúdo existente. Para atualizar um projeto já configurado, crie uma migração incremental, sem remover tabelas ou políticas às cegas.
2. Copie `.env.example` para `.env.local` e configure `SUPABASE_URL` e `SUPABASE_ANON_KEY` com a URL do projeto e a chave publicável/anon. Na Vercel, cadastre as mesmas variáveis no ambiente adequado. Nunca coloque uma chave `service_role` nessas variáveis.
3. Em Authentication, desative inscrições públicas e convide/crie uma conta administrativa. Defina a senha em fluxo seguro do Supabase, nunca em código ou chat. Configure limites do Auth, Site URL e URLs de recuperação para seu domínio real. A recuperação de senha deve ser conduzida pela administração do projeto até existir uma tela específica.
4. Insira o UUID da conta em `studio_admins`, pelo SQL Editor, conforme o comentário ao final da migração. A própria conta não pode conceder permissão a si mesma. Contas autenticadas sem associação são recusadas.
5. Acesse `/admin/login`. Na primeira entrada, clique em **Salvar alterações** para inicializar o banco com o conteúdo local, incluindo o acervo anterior. Edite preços, serviços, textos e URLs oficiais nos formulários do painel.
6. Cadastre os links de conversa oficiais fornecidos por suas contas (Messenger e Instagram Direct), além das URLs públicas do Facebook e Instagram. Não usamos links inventados nem convertidos automaticamente de um nome presumido.
7. Teste o acesso anônimo, uma conta não administrativa, upload autorizado, edição, conflito de revisões, registro consentido de pedido e exclusão antes de ativar em produção. A integração real não foi validada sem um projeto fornecido.
8. No ambiente de nuvem com saída restrita, autorize somente o hostname do seu projeto (`SEU-PROJETO.supabase.co`) nas configurações de rede. O frontend aceita imagens locais ou URLs HTTPS do bucket `portfolio` de projetos Supabase `.co`.

O painel usa Supabase Auth com cookies HttpOnly, checagem de usuário e associação no servidor em cada ação. RLS protege pedidos, marketing, alterações de conteúdo e uploads. Não é apenas uma barreira visual. Escritas têm controle de revisão para evitar sobrescrever alterações de outro acesso. Dados de marketing nunca entram na consulta de conteúdo público.

O bucket `portfolio` é público e aceita JPEG, PNG e WebP até 5 MB. **Somente imagens demonstrativas ou autorizadas para publicação.** Não envie retratos privados de clientes. Excluir da galeria remove a referência; o arquivo original permanece no Storage para preservar materiais e referências. Limpeza definitiva pode ser feita separadamente pelo administrador do Storage, após conferir referências e autorizações.

## Central de Divulgação e Marketing

Restrita a `/admin/marketing` com as mesmas verificações de conta e RLS:

- Calendário mensal de planejamento (sem execução automática).
- Campanhas com imagem da biblioteca, legenda, hashtags, notas, canal e aprovação explícita para uso manual. Alterar material aprovado o devolve a rascunho.
- Biblioteca com upload de materiais promocionais autorizados.
- Cadastro de grupos do Facebook, links e regras; botão abre apenas o grupo selecionado para uso manual.
- Histórico de compartilhamentos, alcance e interações informados manualmente. Campo vazio é desconhecido, não zero. Registre a fonte nas observações.
- Sugestões editoriais para quatro linhas de serviço, aproveitáveis como rascunho.

Salvar, aprovar ou escolher uma data **não publica campanhas**. Nenhum robô de grupos, disparo de mensagens, comentários em massa ou envio para clientes foi implementado. Não há conexão Meta fictícia. Veja `docs/META.md` para a próxima etapa oficial.

## Privacidade e conteúdo

Os dados padrão estão em `src/lib/studio.ts`; o acervo anterior permanece em `src/lib/content.ts`. As ilustrações locais são demonstrativas e substituíveis. Após configurar o banco, as páginas leem as alterações do painel sem alterar o código. Nenhuma fotografia de cliente é publicada por padrão.

Defina um prazo de retenção para pedidos e um canal oficial para solicitações de acesso, correção ou exclusão antes de ativar o recebimento. A administração pode excluir pedidos no painel. A autorização de criação com IA não equivale à autorização de divulgação, especialmente para imagens de crianças.

## Prévia e Vercel

A prévia funcional é o servidor local iniciado por `npm run dev` ou `npm start` depois do build. Capturas para aprovação ficam em `docs/preview/`. Elas não representam um deploy e não expõem áreas privadas do painel.

Para publicar **somente após aprovação**, envie o código ao GitHub e importe o repositório na Vercel com preset Next.js, Node 24, `npm ci` e `npm run build`, mantendo a saída padrão. Configure as variáveis do Supabase se quiser ativar recursos persistentes. Não é necessário conectar a Meta para navegação, seleção de pedidos ou compartilhamento manual. Defina domínio e URLs canônicas apenas com os endereços oficiais reais.

Nenhum deploy, push ou publicação em rede social é executado por este projeto ao compilar.

## Testes reproduzíveis

`node tests/validation.mjs` testa esquemas, valores, autorização de registro, URLs oficiais, datas e preservação do acervo. Não usa credenciais ou rede.

`tests/browser.mjs` exercita a versão sem Supabase (prévia) no Chromium: navegação, páginas privadas inacessíveis, escolhas de serviço/pacote, cópia do resumo, ausência de transmissão sem consentimento, filtros e ampliação, API, responsividade em 320/390/768/1024 px e capturas. Instale `playwright-core` em um diretório temporário (não é dependência do site), aponte `PLAYWRIGHT_MODULE` para esse módulo e `CHROMIUM_PATH` para seu Chromium. Com `npm start -- --port 3001` em outro processo:

```sh
PLAYWRIGHT_MODULE=/caminho/temporario/node_modules/playwright-core node tests/browser.mjs
```

`TEST_BASE_URL` permite alterar a porta. Capturas são atualizadas em `docs/preview/`. Os testes não enviam campanhas, não acessam perfis oficiais e não registram dados em um banco externo. A validação real de Auth/RLS/Storage e persistência exige o seu projeto Supabase e continua pendente.
