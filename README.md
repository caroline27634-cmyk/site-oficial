# Encanto no Retrato Studio IA

Next.js 16, React 19, TypeScript e Tailwind CSS 4. Design aprovado preservado; desenvolvimento na branch `desenvolvimento-galeria`, sem publicação automática.

## Visualizar no Windows gratuitamente

1. Instale Node.js LTS de https://nodejs.org/.
2. No GitHub, selecione a branch desenvolvimento-galeria, clique Code > Download ZIP e extraia em uma pasta nova.
3. Na pasta com `package.json`, digite `cmd` na barra de endereço do Explorador e pressione Enter.
4. Execute `npm ci` e depois `npm run dev`.
5. Abra `http://localhost:3000` no seu próprio navegador. Para a galeria, use `/galeria`. Mantenha o terminal aberto; Ctrl+C encerra.

Sem Supabase, as páginas, filtros, ampliação e resumos copiáveis usam os dados locais. Login administrativo e gravação de pedidos não são simulados. No Chrome/Edge, F12 e Ctrl+Shift+M permitem simular celular.

## Conteúdo preservado

29 referências: coleções Recém-nascidos, Ensaios infantis, Mesversários e Aniversários, além das ilustrações anteriores. Oito categorias, títulos, descrições, ordem relativa e arquivos originais foram preservados. As 14 amostras recortadas continuam identificadas e pendentes de substituição. Preços continuam 1 foto por R$ 2,50, 5 por R$ 10 e 10 por R$ 20.

Rotas: `/`, `/quem-somos`, `/nossos-servicos`, `/precos-e-pacotes`, `/galeria`, `/como-funciona`, `/contato`, `/contato/confirmacao`, `/privacidade`. O acervo editorial segue em `/publicacoes`; `/sobre` redireciona para Quem somos.

## Painel e dados privados

- `/admin/login`: autenticação real Supabase, sem cadastro público ou senha de demonstração.
- `/admin`: textos, links, preços, serviços, categorias, upload/substituição/remoção da galeria, ordem e pedidos consentidos.
- `/admin/prompts`: edição, importação e exclusão de prompts privados, com checagem no servidor e RLS.
- `/admin/marketing`: campanhas, calendário, biblioteca, legendas, hashtags, links de destino, grupos e histórico de compartilhamentos manuais. Aprovar ou salvar não publica.

O perfil informado é `@encantonoretrato.studioia`. Messenger/Facebook continuam pendentes dos endereços oficiais. Atendimento somente por Instagram Direct ou Messenger; não há WhatsApp, telefone pessoal ou endereço residencial. A solicitação não é pagamento ou contratação. Sem consentimento, os dados ficam somente no resumo temporário da aba e não são registrados no banco.

[Configurar Supabase em passos simples](docs/SUPABASE.md). Execute base, migração 002 e seed público; autorize a conta administrativa e configure somente URL e chave publicável/anon. Nunca use service_role no código da aplicação. Os campos em `.env.example` estão vazios.

Os prompts foram transferidos dos documentos versionados para `.private/`, ignorado pelo Git, e preparados para importação privada. Os manifestos em `docs/colecoes` contêm apenas metadados de imagens. Os prompts antigos ainda existem no histórico: reveja a privacidade do repositório ou a necessidade de limpeza autorizada do histórico. Um clone/ZIP novo não recebe a pasta privada; guarde os ZIPs originais e o arquivo privado preservado no ambiente.

## Testar

```sh
npm run lint
npm test
npm run test:security
npm run test:db
npm run build
npm run typecheck
npm start -- --port 3001
```

Em outro terminal com Chromium instalado: `npm run test:browser` e `npm run test:a11y`. `TEST_BASE_URL` e `CHROMIUM_PATH` permitem selecionar servidor/navegador. Os testes SQL usam PostgreSQL local em WASM com funções de infraestrutura Supabase adaptadas para o teste; não criam nem configuram um serviço externo.

`npm run check:production` relata pendências e pode falhar intencionalmente até resolver imagens, configuração e acessibilidade. Veja [o checklist de publicação](docs/PRODUCAO.md). Não houve deploy nem configuração de domínio. A integração oficial com APIs da Meta permanece não conectada; veja `docs/META.md`.
