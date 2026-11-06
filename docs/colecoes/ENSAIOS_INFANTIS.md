# Coleção Ensaios Infantis — somente prévia

A categoria já existia como **Ensaios infantis**; o alias Infantis é mantido. Não foi criada uma categoria duplicada. As quatro referências foram acrescentadas depois da coleção de Recém-nascidos, preservando todos os itens anteriores e sua ordem relativa. Agora são 21 referências no total e cinco na categoria infantil (quatro fotografias demonstrativas e uma ilustração anterior).

| Arquivo                     | Título           | Dimensões    | Pendência                                                |
| --------------------------- | ---------------- | ------------ | -------------------------------------------------------- |
| INF_01_Doce_Encanto.jpg     | Doce Encanto     | 634 × 579 px | Original individual maior antes da publicação definitiva |
| INF_02_Jardim_das_Fadas.jpg | Jardim das Fadas | 668 × 579 px | Original individual maior antes da publicação definitiva |
| INF_03_Pequeno_Aviador.jpg  | Pequeno Aviador  | 634 × 611 px | Original individual maior antes da publicação definitiva |
| INF_04_Reino_dos_Sonhos.jpg | Reino dos Sonhos | 668 × 611 px | Original individual maior antes da publicação definitiva |

## Qualidade

Os quatro JPEGs foram decodificados e inspecionados visualmente. São crianças fictícias geradas por IA, conforme declarado no pacote. Todos são recortes de uma composição 2×2, em proporções próximas do quadrado, não os retratos verticais individuais descritos nos prompts. Há bordas claras e, em alguns arquivos, faixas remanescentes da composição. A resolução permite avaliar os modelos na prévia, mas não deve ser apresentada como alta resolução final.

Todos estão marcados `sample: true`: o aviso de recorte e substituição aparece no cartão e na ampliação. Os arquivos foram preservados byte a byte, sem recompactação, recorte adicional, retoque ou ampliação artificial. Não contêm campos EXIF. Os hashes constam no manifesto. Recomenda-se solicitar os quatro arquivos individuais maiores, com enquadramento definitivo e sem bordas da montagem, antes da publicação. Não foi criado um padrão obrigatório de resolução nesta integração.

## Conteúdo e prompts

- Dados públicos: `src/lib/children-collection.ts`, com os títulos e descrições exatos da tabela fornecida.
- Imagens: `public/images/ensaios-infantis/`.
- Prompts e orientação comum originais: `docs/colecoes/ensaios-infantis.prompts.json`.
- Documento recebido: `docs/colecoes/INSTRUCOES_E_PROMPTS_INFANTIS.md`.

Prompts não são importados pelos componentes nem colocados na pasta pública; não aparecem na galeria e não foram executados. Qualquer uso futuro de fotografias de clientes exige autorização do responsável; as identidades dos modelos demonstrativos não devem ser copiadas.

## Preservação e limitações

Não houve alteração de design, CSS, fontes, cores, layout, preços, navegação, componentes de contato ou schema. Filtros, ampliação, setas, Escape e “Quero um ensaio assim” continuam usando os componentes existentes. O resumo inclui o nome e a categoria escolhidos, sem enviar dados ou mensagens automaticamente.

Os dados locais alimentam a prévia sem Supabase. Upload e gravação pelo painel continuam dependendo da configuração do serviço. Se o banco estiver preenchido futuramente, inserir as referências de forma aditiva pelo painel: os padrões locais não substituem o banco. Os canais sem links oficiais permanecem indisponíveis, sem perfis inventados.

## Visualizar no Windows

1. Abra a branch `desenvolvimento-galeria` no GitHub após confirmar o envio desta versão.
2. Use Code > Download ZIP e extraia em uma pasta nova.
3. Com Node.js LTS instalado, abra `cmd` na pasta com `package.json`.
4. Execute `npm ci` e depois `npm run dev`.
5. Abra `http://localhost:3000/galeria` e escolha **Ensaios infantis**.

Para quem já usa Git, atualizar essa branch com `git pull --ff-only` após preservar alterações locais, instalar dependências com `npm ci` e reiniciar o servidor. Nenhum deploy, domínio ou alteração da main é necessário.
