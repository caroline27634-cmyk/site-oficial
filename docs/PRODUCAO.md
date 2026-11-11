# Publicação — ainda não autorizada

O projeto continua em desenvolvimento-galeria. Não houve deploy, configuração de domínio, acesso à conta Instagram ou publicação de campanhas.

## Antes de receber clientes

1. Configurar Supabase seguindo `docs/SUPABASE.md` e testar Auth, RLS, Storage e persistência na sua conta real. Os testes locais não substituem essa validação.
2. Substituir as 14 amostras recortadas por versões individuais em alta resolução e revisar as 14 ilustrações temporárias e a foto RN_01 antes de aprovar a versão pública. O aviso de amostra permanece no catálogo; nenhum arquivo foi promovido automaticamente a definitivo.
3. Confirmar o perfil Instagram e cadastrar o Messenger oficial. Os links abrem conversas por decisão do visitante; não há envio automático ou integração OAuth da Meta.
4. Rever o contraste dos textos sinalizados em `docs/ACESSIBILIDADE.json`. As cores aprovadas não foram alteradas. Uma correção visual depende da aprovação da proprietária; esta versão não pode ser declarada integralmente conforme WCAG AA.
5. Definir prazo de retenção dos pedidos, canal para direitos dos titulares, termos de pagamento/entrega/revisões e ferramentas de IA utilizadas. Confirmar tratamento de fotos de menores com autorização do responsável e consentimento separado para divulgação. Os textos aprovados não foram reescritos nesta etapa.
6. Restringir o acesso aos prompts em históricos antigos do GitHub, se o repositório for público. A versão atual usa área privada e não contém os textos dos prompts.
7. Configurar proteção contra abuso na hospedagem (por exemplo, limites do Firewall Vercel e do Supabase Auth). A API tem limite de bytes, validação de origem, honeypot, consentimento e o banco limita duplicatas e volume global. Isso não é um CAPTCHA nem uma proteção completa contra bots; a cota global de 100 pedidos/hora pode afetar clientes sob abuso.

## Verificações

```sh
npm ci
npm run lint
npm test
npm run test:security
npm run test:db
npm run build
npm run typecheck
npm start -- --port 3001
# Em outro terminal, com Chromium instalado:
npm run test:browser
npm run test:a11y
npm run check:production
```

`check:production` é uma barreira de diagnóstico, não um comando de deploy. Deve sair com código 1 enquanto houver pendências, inclusive imagens provisórias, Supabase ou Messenger ausentes e achados de acessibilidade. Não desative checks apenas para liberar a publicação.

`test:a11y` registra o contraste separadamente e reprova falhas graves não visuais. O relatório completo inclui as violações de contraste; a saída zero desse teste não significa acessibilidade total. Os testes de navegador usam Chromium pelo caminho `CHROMIUM_PATH` (padrão Linux `/usr/bin/chromium`); no Windows, informe o caminho do Chrome instalado. A navegação normal pelo site não exige essas ferramentas de teste.

## Vercel, somente depois da autorização

O preset Next.js pode usar Node.js 24, instalação `npm ci` e build `npm run build`, com diretório de saída padrão. Cadastre `SUPABASE_URL` e `SUPABASE_ANON_KEY` nas variáveis do ambiente escolhido; nunca coloque tokens administrativos no cliente. O projeto não precisa de domínio personalizado para uma implantação autorizada.

Importar o repositório no painel da Vercel pode disparar uma implantação. Não faça isso antes da aprovação. A branch main ainda não foi alterada; a escolha da branch de publicação ou um merge deve ser autorizada separadamente. Rever a proteção de Preview Deployments antes de compartilhar links com dados reais.

O bucket `portfolio` contém somente materiais autorizados para exibição pública. Prompts e arquivos privados não devem ir a `public/`, ao seed público, ao marketing público ou aos metadados SEO. Credenciais de servidor continuam em variáveis protegidas.
