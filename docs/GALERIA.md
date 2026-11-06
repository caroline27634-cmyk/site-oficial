# Catálogo de ensaios — desenvolvimento-galeria

## O que mudou

A rota `/galeria` apresenta as oito categorias solicitadas e 21 referências de ensaio (14 ilustrações anteriores, três fotografias demonstrativas de Recém-nascidos e quatro amostras de Ensaios infantis). As nove imagens do catálogo anterior continuam presentes, com seus identificadores, títulos e arquivos preservados. Os seis exemplos editoriais anteriores estão agrupados em Transformações com IA como referências de atmosfera e cenários; não são apresentados como retratos finais.

Cada cartão abre uma imagem ampliada, título, categoria e descrição. O original abre em outra aba sem recortar ou reduzir o arquivo. O acervo anterior usa ilustrações temporárias feitas com auxílio de IA. A coleção Recém-nascidos acrescenta três fotografias demonstrativas de personagens fictícios; duas são amostras recortadas explicitamente identificadas e pendentes de substituição antes da publicação. Veja `docs/colecoes/RECEM_NASCIDOS.md` para a avaliação e os prompts organizados.

“Quero um ensaio assim” abre a escolha de canal e um resumo com nome, categoria, descrição e identificador do exemplo. O visitante copia a referência e envia pelo Instagram Direct ou Messenger. Não há preenchimento automático presumido nem envio de mensagens. Links ainda vazios aparecem indisponíveis, com explicação; não foram inventados perfis.

Preços, pacotes, serviços e outras rotas não foram alterados.

## Painel e Supabase: pendente de configuração

Em `/admin`, a seção Galeria e categorias está preparada para criar/remover referências, trocar arquivos, editar título/descrição/categoria e identificar uma imagem como ilustração temporária ou demonstração de personagem fictício com IA. Os botões Mover para cima/baixo alteram a ordem. Use Salvar alterações para gravar no banco conectado; a mesma ordem do array será mostrada no catálogo.

Os campos novos são compatíveis com registros antigos: descrições ausentes recebem texto de apoio na interface e o tipo padrão é temporário. As categorias antigas conhecidas são agrupadas nas novas categorias, preservando títulos e arquivos; categorias personalizadas continuam disponíveis. Nenhum banco foi configurado ou modificado nesta etapa.

A persistência, login real e uploads dependem do Supabase conforme o README. Sem ele, o catálogo e a cópia da referência funcionam com os dados locais; o painel não simula edição persistente. Os links oficiais de Messenger e Instagram Direct devem ser cadastrados no painel conectado.

Uploads individuais aceitam JPEG, PNG e WebP até 5 MB; para fotos de alta resolução maiores, prepare uma versão dentro desse limite ou solicite uma revisão separada da configuração de armazenamento. Remover do catálogo não apaga o arquivo original do Storage.

## Abrir no Windows

1. Abra a branch `desenvolvimento-galeria` no GitHub, após o envio confirmado.
2. Clique Code > Download ZIP e extraia o arquivo em uma pasta nova, para preservar sua versão anterior.
3. Instale Node.js LTS pelo site oficial, caso ainda não tenha.
4. Dentro da pasta com `package.json`, digite `cmd` na barra de endereço do Explorador e pressione Enter.
5. Execute `npm ci` e, ao terminar, `npm run dev`.
6. Abra `http://localhost:3000/galeria` no seu navegador. Mantenha o terminal aberto. Se houver outra versão na porta 3000, encerre-a com Ctrl+C primeiro.
7. Para simular celular no Chrome/Edge, pressione F12 e depois Ctrl+Shift+M.

Se você usa Git: `git fetch origin`, `git switch --track origin/desenvolvimento-galeria` (na primeira vez), `npm ci`, `npm run dev`. Preserve alterações locais antes de trocar de branch.

## Validação

- `npm test`: oito categorias, descrições e tipos, compatibilidade com registros antigos, preservação do acervo, ordenação sem mutação e preços originais.
- `npm run lint`, `npm run build`, `npm run typecheck`.
- `tests/browser.mjs`: filtros, cartões, modal, descrição, referência copiável sem transmissão de dados, canais indisponíveis sem links, Escape, setas e restauração de foco. Também repete testes das páginas, pacotes e quatro larguras de tela.
- Imagens de revisão em `docs/preview/galeria-desktop.png`, `galeria-mobile.png` e `galeria-solicitacao.png`.

Auth, RLS e gravação reais continuam sem teste em um projeto Supabase, porque esse serviço não foi configurado. Nenhum deploy, domínio ou campanha foi configurado/publicado.
