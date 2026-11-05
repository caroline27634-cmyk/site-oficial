# Integração oficial com a Meta — não ativada

A Central atual funciona como organizador privado e facilita ações manuais. Não possui OAuth, tokens, publicação remota ou coleta de métricas. Esses recursos dependem de um aplicativo autorizado e de implementação adicional testada; não basta cadastrar o link de um perfil.

## Preparação

1. Use contas profissionais próprias e uma Página do Facebook que você administra. Verifique elegibilidade e vínculo de Página/Instagram para o produto escolhido.
2. Crie um aplicativo no [Meta for Developers](https://developers.facebook.com/) e selecione o produto oficial apropriado. As rotas de Facebook Login e Instagram Login têm permissões e requisitos diferentes.
3. Consulte a documentação atual de [Pages](https://developers.facebook.com/docs/pages-api/) e [Instagram](https://developers.facebook.com/docs/instagram-platform/). Exemplos de permissões que podem ser necessárias na modalidade Facebook Login incluem `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `instagram_basic` e `instagram_content_publish`; isso não é garantia de disponibilidade ou autorização. Métricas dependem das permissões de insights, da conta e do tipo de mídia. Confirme os nomes e o fluxo exigidos pela versão da API escolhida antes de implementar.
4. Implemente OAuth com `state` verificado, callback HTTPS no servidor, seleção explícita de contas autorizadas, privilégio mínimo e recursos de desconexão/revogação. Configure as URLs de política de privacidade e exclusão de dados exigidas. App Review e verificação da empresa podem ser necessários para acesso fora dos usuários de teste.
5. Tokens e segredos do app devem ser armazenados apenas no servidor, criptografados em repouso, separados do conteúdo público e do JSON de marketing. Não colocar tokens em `NEXT_PUBLIC_*`, materiais, legendas ou logs. Implementar validade, renovação suportada e falhas de autorização.
6. Antes de uma publicação remota, adicionar uma prévia da conta de destino, mídia e texto e exigir aprovação explícita da versão exata do material. Registrar o ID retornado pela Meta, estado e erro real, com idempotência. Aprovação de um rascunho local não deve disparar publicação por si só.
7. Validar cada formato em conta de teste e somente então habilitar produção. Métricas não disponíveis devem permanecer identificadas como indisponíveis; não substituir por números fabricados.

## Limites desta versão

Grupos do Facebook são apenas cadastros locais de links, regras e histórico. Abrir um grupo não participa dele nem compartilha um post automaticamente. Não implementar endpoints presumidos de publicação em grupos; o antigo Groups API não deve ser usado como base para uma integração nova.

Messenger e Instagram Direct abrem os links oficiais cadastrados no painel. Não há mensagens proativas, preenchimento automático presumido ou leitura de conversas. O cliente pode copiar o resumo e enviá-lo por iniciativa própria. Nenhuma chave da Meta é necessária para essa navegação manual.
