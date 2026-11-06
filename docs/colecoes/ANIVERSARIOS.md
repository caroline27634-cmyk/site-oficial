# Aniversários temáticos — somente prévia

Quatro referências foram adicionadas à categoria **Aniversários**, já existente: Princesa do Castelo, Pequeno Cowboy, Aventura Jurássica e Encantos do Fundo do Mar. O catálogo passou a ter 29 referências, sendo cinco nesta categoria (as quatro novas e a ilustração anterior). Todos os registros anteriores e sua ordem relativa foram preservados.

## Qualidade

Todos os JPEGs têm **768 × 512 px**, foram decodificados e inspecionados visualmente e não contêm campos EXIF. São demonstrações de IA, recortadas de uma montagem, com bordas claras e pequenas faixas da composição original. Servem para avaliar os temas na prévia, mas não são fotografias individuais finais em alta resolução.

Os quatro registros têm `kind: ai` e `sample: true`. O cartão e o modal exibem a identificação de demonstração IA e o aviso de amostra recortada, pendente de substituição antes da publicação. Os arquivos foram copiados byte a byte, sem edição, novo recorte, recompactação ou ampliação artificial. Hashes, dimensões e pendências estão no manifesto. Receber e aprovar os quatro originais individuais em alta resolução antes de publicar definitivamente.

## Conteúdo e prompts

- Dados públicos: `src/lib/birthday-collection.ts`, com os títulos e descrições exatos fornecidos.
- JPEGs originais: `public/images/aniversarios/`.
- Prompts, orientação comum e avaliação: `docs/colecoes/aniversarios.prompts.json`.
- Instruções recebidas: `docs/colecoes/INSTRUCOES_E_PROMPTS_ANIVERSARIOS.md`.

A documentação não fica em `public/`, não é uma rota e não é importada pela galeria. Os prompts não foram executados nem exibidos aos visitantes. Não foram adicionados dados de clientes ou credenciais.

## Preservação e testes

Design, CSS, cores, fontes, navegação, preços e componentes de galeria permanecem sem alterações. A integração reutiliza filtros, ampliação, setas, Escape e “Quero um ensaio assim”. O resumo de contato identifica o título e a categoria escolhidos sem transmitir dados automaticamente. Testes cobrem o carregamento dos quatro JPEGs nas dimensões originais, avisos de amostra, títulos, descrição e resumo, além das verificações das coleções anteriores e responsividade.

O catálogo local funciona sem Supabase. Login, upload e gravação pelo painel continuam dependendo da configuração do serviço. Para um banco já preenchido no futuro, importar os registros de forma aditiva: os padrões locais não sobrescrevem o banco. Canais sem links oficiais permanecem indisponíveis; o resumo copiável continua funcionando.

## Visualizar no Windows

Depois do envio confirmado, abra a branch `desenvolvimento-galeria` no GitHub, escolha Code > Download ZIP e extraia em uma pasta nova. Com Node.js LTS instalado, abra `cmd` na pasta com `package.json`, execute `npm ci` e depois `npm run dev`. Acesse `http://localhost:3000/galeria` e selecione **Aniversários**.

Se já usa Git, preserve alterações locais, atualize esta branch com `git pull --ff-only`, execute `npm ci` e reinicie o servidor. Não houve deploy, configuração de domínio ou alteração da main.
