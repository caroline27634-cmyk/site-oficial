# Entrelinha — portal de conteúdos digitais

Primeira versão do site oficial: Next.js 16 (App Router), React 19, TypeScript e Tailwind CSS 4. Interface em português, responsiva, sem associação à imagem pessoal de uma pessoa. “Entrelinha” é uma identidade provisória editável.

## Desenvolvimento

Requisitos: Node.js 20.9 ou superior (validado com Node 24) e npm.

```sh
npm ci
npm run dev
```

O servidor usa a porta 3000. Para verificar e executar em produção:

```sh
npm run lint
npm run build
npm run typecheck
npm start
```

Execute o build antes do typecheck em um checkout novo para gerar os tipos das rotas. O lockfile fixa as versões efetivamente instaladas.

## Páginas e recursos

- `/`: início com destaque, publicações recentes e acesso à galeria.
- `/galeria`: álbuns filtráveis e visualização em modal nativo, com Escape, foco contido e setas do teclado para navegar.
- `/publicacoes`: filtro por categoria e artigos individuais em `/publicacoes/[slug]`.
- `/sobre`: apresentação editorial.
- `/contato`: validação nativa de nome, e-mail, assunto, mensagem e ciência sobre a demonstração. **Não envia nem armazena dados.** O resultado explica que o envio está indisponível.
- `/admin`: aviso público de preparação, sem login, dados privados ou endpoints administrativos. Não é um painel protegido ou funcional.

## Personalização

Edite `src/lib/content.ts` para adicionar, editar ou remover publicações e imagens, mudar categorias, álbuns e links oficiais. Use slugs únicos e datas ISO `AAAA-MM-DD`. Alterações exigem um novo deploy. Os links sociais começam vazios: preencha somente URLs HTTPS verificadas em `socialLinks`. Eles serão exibidos automaticamente na página de contato e nas áreas de redes.

As ilustrações SVG originais estão em `public/images`. Para usar fotografias, coloque arquivos nessa pasta e atualize os caminhos e descrições em `content.ts`. Não há dependência de um serviço externo de imagens. Use apenas imagens autorizadas. O acervo e os artigos atuais são demonstrativos.

A marca é exibida pelo componente `Brand` em `src/components/ui.tsx`; ajuste também o rodapé e os metadados em `src/app/layout.tsx`, o favicon em `src/app/icon.svg` e os textos editoriais. Cores, tipografia e espaçamentos estão em `src/app/globals.css`. Não há fontes externas nem credenciais necessárias nesta versão.

## Publicação na Vercel

1. Envie este projeto ao seu repositório GitHub.
2. Na Vercel, importe o repositório e selecione o diretório que contém `package.json` como Root Directory.
3. Use o preset **Next.js**, Node.js 24, instalação `npm ci` e build `npm run build`. Mantenha o diretório de saída padrão.
4. Esta versão não precisa de variáveis de ambiente. Faça o deploy e valide as páginas, filtros e modal também em celular.
5. Quando houver domínio definitivo, configure-o na Vercel e adicione `metadataBase`, URL canônica e sitemap adequados ao domínio real. Nenhum domínio oficial foi inventado.

## Próxima etapa: administração e contato reais

Sugestão: Supabase Auth + Postgres + Storage. Criar tabelas de publicações, álbuns, fotos e configurações; habilitar RLS em todas as tabelas e políticas do Storage; permitir leitura pública apenas de conteúdos publicados e escrita apenas para administradores autorizados. Validar sessão e papel no servidor em cada operação, além de proteger as rotas. Não usar apenas ocultação visual como controle de acesso. Configurar convites de administradores sem cadastro público, limites e validação de uploads.

A URL do projeto e a chave publicável podem ser configuradas nas variáveis apropriadas. Chaves privilegiadas devem permanecer exclusivamente no servidor, nunca com prefixo `NEXT_PUBLIC_`, nunca em commits. Nenhuma credencial é incluída neste projeto.

Para o contato, implementar uma Server Action ou rota de API com validação no servidor, proteção contra abuso, limite de tamanho, política de privacidade e provedor de e-mail configurado. Só então trocar a ação demonstrativa por envio real e exibir sucesso após confirmação do provedor. Não coletar dados pessoais antes dessa configuração.

O site é funcional para navegação e leitura estática. Edição pelo navegador, autenticação e entrega de mensagens dependem dessas integrações futuras.
