# Diagnosticar falha de envio de recuperação sem expor dados

## O que foi identificado no código

A mensagem “Não foi possível solicitar a recuperação agora” era retornada quando `resetPasswordForEmail` devolvia um erro que não era reconhecido como rate limit. O objeto era descartado e não havia registro seguro para diferenciar as falhas.

`POST /admin/esqueci-senha 200` é o sucesso do transporte da **Server Action** do Next.js: ela executou e devolveu um estado de formulário. Não significa que o Supabase aceitou o pedido ou que o Gmail entregou o e-mail. O teste isolado reproduz exatamente uma Server Action 200 com erro 500/401 do provedor e referência correspondente no log.

A aplicação não se conecta diretamente ao Gmail: ela chama Supabase Auth, e o serviço Auth usa o SMTP configurado no Dashboard. Senha do Gmail, senha de aplicativo e demais credenciais SMTP não devem ser adicionadas ao `.env.local` do site.

A mensagem observada indica que o fluxo chegou ao tratamento de erro do SDK. Não comprova qual é a causa externa. O agente não acessou seu Dashboard, não inspecionou suas configurações reais de Gmail e não enviou e-mails reais.

## Atualizar e verificar sem enviar e-mail

1. Atualize somente a branch `desenvolvimento-galeria` ou baixe seu ZIP atualizado.
2. Preserve o `.env.local` do seu computador; ele não está no GitHub e não deve ser compartilhado. Se trocar de pasta, copie-o em particular para a nova pasta.
3. Na pasta com `package.json`, execute `npm ci`.
4. Execute:

```bat
npm run diagnose:recovery
```

Esse comando é **offline**, não chama o Supabase e não consome cota de e-mail. Ele usa a ordem de leitura de variáveis do Next.js em desenvolvimento. Para `npm start`, use `npm run diagnose:recovery -- --production`.

O resultado informa presença/validade de `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `APP_URL`, sem mostrar URL/chave do Supabase ou seu conteúdo. Mostra somente o endereço público validado de retorno. Para este projeto local, o esperado é:

```text
http://localhost:3000/admin/auth/confirm
```

`APP_URL=http://localhost:3000` deve conter apenas a origem, sem `/admin`, parâmetros ou fragmentos. Em desenvolvimento, a ausência de APP_URL usa localhost:3000; configure explicitamente se usa outra porta. No modo de produção, a ausência de APP_URL é recusada.

Uma validação de formato não confirma que a chave pertence ao projeto da URL, que o redirect está permitido no Dashboard nem que o SMTP funciona. Confira essa correspondência em particular, sem publicar valores. Variáveis já definidas no terminal podem prevalecer sobre o arquivo; reinicie o terminal/servidor depois de corrigir sua configuração.

## Como obter o diagnóstico de uma tentativa

Depois da verificação offline, reinicie `npm run dev`. Se a cota de e-mails estiver bloqueada, aguarde sua liberação antes de solicitar novamente. Não faça várias tentativas em sequência.

Em uma única tentativa manual, a tela mostrará uma **Referência** quando houver falha. O terminal terá uma linha iniciada por `[auth.recovery]`, com a mesma referência e campos permitidos:

- `stage`: configuração, inicialização do cliente, resposta do provedor ou exceção;
- `category`: classificação resumida, não uma causa externa comprovada;
- `providerStatus`: status recebido pelo SDK, quando disponível;
- `providerCode`: somente código conhecido permitido; `unrecognized` se não disponível ou não reconhecido;
- `errorType`: somente tipo de erro conhecido;
- `configuration`: indicadores booleanos, incluindo se a origem do navegador coincide com APP_URL;
- `redirectPath`: caminho fixo `/admin/auth/confirm`.

Não são registrados e-mail (nem hash do e-mail), senhas, tokens, cookies, cabeçalhos de autorização, URL/chave do Supabase, mensagem bruta do erro, stack ou causa. Não foi criado modo de debug que imprima esses dados. Se precisar de ajuda, compartilhe apenas essa linha sanitizada e a referência, não o terminal completo ou `.env.local`.

## Interpretação e próximas verificações, sem alterar configurações automaticamente

| Categoria                | Evidência possível                                                | O que verificar                                                                                                                                                                                                                                                         |
| ------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rate_limit`             | Status 429, código conhecido ou mensagem reconhecida internamente | Aguardar a cota do Supabase e limites do serviço de e-mail. SMTP personalizado não elimina os limites de Auth. Não desative limites para contornar o bloqueio.                                                                                                          |
| `email_delivery`         | Erro relacionado a envio/SMTP; frequentemente status 500          | Consultar Auth Logs do Supabase no horário da tentativa. Verificar em particular autenticação/credenciais SMTP, compatibilidade de host/porta/TLS, remetente permitido, template e possíveis bloqueios do Gmail. Essa categoria não prova que a senha SMTP está errada. |
| `auth_configuration`     | Status 401/403 ou código de configuração conhecido                | Conferir projeto e chave publicável/anon correspondentes, configuração do provedor e restrições do projeto. Nunca trocar para service_role para “resolver”.                                                                                                             |
| `redirect_configuration` | Mensagem de erro relacionada a redirecionamento                   | Comparar APP_URL, Site URL e Redirect URL. Uma URL não permitida pode causar fallback em vez de falha de envio; não atribua todo erro de SMTP a esse campo.                                                                                                             |
| `captcha`                | `captcha_failed`                                                  | Verificar se o projeto exige CAPTCHA e se a integração correspondente está configurada. Não desativar a proteção como atalho.                                                                                                                                           |
| `network`                | Falha de conexão, fetch ou timeout sem resposta útil              | Verificar conectividade, proxy/TLS e duração da requisição. O cliente do site tem timeout de 8 segundos; isso pode deixar o resultado do envio indeterminado. Não repetir automaticamente.                                                                              |
| `provider_unclassified`  | Erro sem identificação suficiente                                 | Correlacionar status/tipo/referência e horário com os Auth Logs. Não habilitar dump completo de erros para descobrir a causa.                                                                                                                                           |

O SDK pode converter HTTP 500 em `AuthRetryableFetchError`, inclusive para erro de envio de e-mail. O nome não prova que a rede falhou. Em algumas respostas, o SDK descarta o código original: o log mostrará `unrecognized`, sem inventar `unexpected_failure`. Mensagens JSON encapsuladas são lidas apenas para classificação; seu conteúdo não é impresso.

Ao consultar logs do Supabase ou Gmail, eles podem conter dados sensíveis. Não os publique nem copie integralmente para o chat. A verificação de senha de aplicativo/2FA e regras do Gmail deve seguir as instruções oficiais e as políticas da sua conta; o agente não alterou nenhum desses itens.

## Estado verificado

Foram testadas respostas simuladas de envio SMTP 500, configuração 401, CAPTCHA 400, limite 429 e código desconhecido. As referências da tela foram comparadas aos logs; o teste confirma que mensagens brutas com marcadores de e-mail, credenciais e códigos não permitidos não aparecem no console do servidor. Também foram testados o fluxo PKCE/token_hash, nova senha, login e bloqueio de não administradores.

Esses testes não usam sua conta Supabase ou Gmail e não provam entrega de e-mail no seu projeto. A correção implementada é de diagnóstico e tratamento seguro dos erros. A causa real do seu envio continua pendente da observação do novo registro local e dos Auth Logs correspondentes.

Não houve deploy, alteração da main, das páginas públicas, do design, dos preços, da galeria ou de configurações externas.
