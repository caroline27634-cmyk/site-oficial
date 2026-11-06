# Mesversários — somente prévia

Quatro referências adicionadas à categoria Mesversários já existente: Ursinho dos Sonhos, Pequena Princesa, Safari Encantado e Abelhinha do Amor. São 25 referências no catálogo e cinco nesta categoria, incluindo a ilustração anterior preservada. As coleções anteriores e sua ordem relativa permanecem intactas.

## Qualidade e pendências

Todos os JPEGs têm **768 × 512 px**, foram decodificados e inspecionados visualmente e não contêm campos EXIF. São personagens fictícios gerados por IA, segundo o pacote. As bordas e faixas da composição original ainda são visíveis. Os quatro arquivos são recortes para avaliação, não originais individuais de alta resolução.

Todos têm `sample: true`, com aviso de substituição antes de publicar. Foram copiados sem editar, recomprimir, recortar ou ampliar artificialmente. Os hashes estão no manifesto. Antes da publicação definitiva, receber os quatro arquivos individuais em alta resolução, conferir enquadramento e números de meses e obter aprovação. Nenhuma imagem foi publicada nesta etapa.

## Meses personalizáveis

As placas atuais mostram números de exemplo, não restrições de contratação. A ampliação e o resumo copiável orientam o cliente a informar o mês desejado no atendimento. Não existe edição automática do número renderizado no JPEG nem garantia de reprodução exata da identidade. Os prompts conservam a orientação de adaptar os meses com consentimento; o manifesto registra a variável `{{meses}}` para reprodução futura.

O campo opcional `customization` mantém a observação pública de personalização e é preservado pelo schema de conteúdo. Os registros antigos continuam válidos. A indicação de amostra só deve ser removida após conferir os arquivos definitivos.

## Organização

- Dados públicos: `src/lib/monthly-collection.ts`, com os títulos e descrições fornecidos.
- Arquivos originais: `public/images/mesversarios/`.
- Prompts, orientações e hashes: `docs/colecoes/mesversarios.prompts.json`.
- Instruções recebidas: `docs/colecoes/INSTRUCOES_E_PROMPTS_MESVERSARIOS.md`.

Os documentos não ficam em `public/`, não são rotas e não são importados pelos componentes. Os prompts não foram executados nem exibidos na galeria. Não há dados de clientes ou credenciais acrescentados.

## Visualizar e editar futuramente

Baixe a branch `desenvolvimento-galeria` atualizada por Code > Download ZIP. Extraia em uma pasta nova, abra `cmd` na pasta com `package.json`, execute `npm ci` e `npm run dev`. Abra `http://localhost:3000/galeria` e filtre Mesversários.

Sem Supabase, a prévia usa os dados locais. Login, upload e gravação pelo painel continuam pendentes da configuração do serviço. O cliente pode copiar o resumo; os canais sociais sem links oficiais continuam indisponíveis. Não houve configuração de serviços externos, domínio, deploy ou alteração da main.
