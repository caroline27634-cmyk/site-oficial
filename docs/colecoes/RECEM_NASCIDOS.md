# Primeira coleção Recém-nascidos — somente prévia

A categoria já existia na branch `desenvolvimento-galeria`. Três novas referências foram acrescentadas ao início do catálogo local, sem remover as 14 referências anteriores, categorias, páginas ou arquivos. Não houve alteração de CSS, cores, fontes, navegação, serviços ou preços.

| Arquivo                     | Título            | Dimensões      | Avaliação e pendência                                                                                                                                 |
| --------------------------- | ----------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN_01_Doce_Soninho.jpg      | Doce Soninho      | 1122 × 1402 px | JPEG íntegro; imagem com detalhes mais definidos, proporção próxima de 4:5. Adequada para avaliação na prévia. Publicação ainda depende de aprovação. |
| RN_02_Pequeno_Anjo.jpg      | Pequeno Anjo      | 407 × 625 px   | Amostra recortada, resolução limitada e borda clara do recorte visível. Substituir por arquivo individual de alta resolução antes de publicar.        |
| RN_03_Jardim_dos_Sonhos.jpg | Jardim dos Sonhos | 412 × 625 px   | Amostra recortada, resolução limitada e borda clara do recorte visível. Substituir por arquivo individual de alta resolução antes de publicar.        |

Os JPEGs foram decodificados e inspecionados visualmente. Não contêm campos EXIF. Foram copiados sem recompactação, edição, novo recorte ou ampliação artificial; os hashes dos arquivos originais estão no manifesto. As imagens 02 e 03 não são apresentadas como originais finais de alta resolução. O modal permite ver o arquivo completo e abrir o original.

A informação de origem IA e variação de resultados aparece na galeria. As amostras recebem aviso nos cartões e no modal. Títulos e descrições públicos são os fornecidos no ZIP. A declaração de personagens fictícios vem do pacote; não há fotografias de clientes ou filhos adicionadas nesta etapa.

## Arquivos e reprodução futura

- `src/lib/newborn-collection.ts`: dados públicos, sem prompts.
- `public/images/recem-nascidos/`: os três JPEGs originais.
- `docs/colecoes/recem-nascidos.manifest.json` (metadados públicos; prompts em `.private/prompts/import.json` e no painel protegido): títulos, descrições, prompts originais, dimensões, pendências e hashes, organizados para consulta futura.
- `.private/originais/` (cópia local ignorada pelo Git): referência às instruções fornecidas.

Os documentos em `docs/` não são rotas ou arquivos estáticos públicos do site e não são importados pelos componentes. Os prompts são apenas registros: não foram executados. Referências futuras devem ser fictícias ou autorizadas; manter os exemplos como criações digitais, sem tratar cenários de fantasia como poses físicas reais.

## Substituir as amostras depois

Após receber as versões individuais definitivas, substituir somente o arquivo/referência correspondente, preservando ID, título, descrição e categoria. O campo `sample` mantém a pendência identificada. Não basta ampliar o JPEG atual para remover a pendência.

O painel ganhou uma seleção de qualidade para conservar esse aviso e removê-lo somente após conferir o arquivo substituto. Login, upload e gravação continuam pendentes da configuração do Supabase. Nenhum serviço externo foi configurado. Para um banco já preenchido futuramente, importar as novas referências de forma aditiva pelo painel; o conteúdo local não sobrescreve o banco.

## Testar no Windows

Baixe a branch `desenvolvimento-galeria` atualizada no GitHub por Code > Download ZIP e extraia em uma pasta nova. Com Node.js LTS instalado, abra `cmd` na pasta com `package.json` e execute `npm ci`, depois `npm run dev`. Abra `http://localhost:3000/galeria` e selecione Recém-nascidos. São três fotografias demonstrativas novas e uma ilustração anterior preservada. Clique em cada uma para conferir descrição, qualidade e “Quero um ensaio assim”.

Sem links oficiais, os botões de Instagram e Messenger continuam indicados como indisponíveis; o resumo copiável funciona. Sem Supabase, o catálogo usa dados locais. Nenhum deploy ou alteração da branch main faz parte desta integração.
