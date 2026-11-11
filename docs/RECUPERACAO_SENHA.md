# Recuperação de senha administrativa — teste local

## Causa identificada

A versão anterior tinha login, mas não tinha formulário de solicitação, confirmação do link ou página para atualizar a senha. A configuração real da sua conta Supabase não está disponível no ambiente do agente; não foi possível inspecionar seu Site URL ou template diretamente. Um link encaminhado ao Site URL inicial terminava sem tratamento de recuperação.

`email rate limit exceeded` é um erro separado: o provedor recusou o envio por limite de e-mails. Esta correção não aumenta cota, não desativa proteção e não faz repetição automática. A espera de 60 segundos do botão é apenas uma proteção de interação, **não** uma promessa de que a cota do projeto será liberada nesse prazo. Aguarde o período indicado pelo Supabase e consulte os registros de Auth do seu projeto. Não solicite vários links em sequência.

## 1. Atualizar o projeto local

Baixe o ZIP atualizado da branch `desenvolvimento-galeria` ou atualize essa branch com Git, preservando suas alterações locais. Se usar outra pasta, copie seu `.env.local` em particular para a nova pasta; ele não está no GitHub. Não envie o arquivo ao chat ou ao repositório.

Na pasta com `package.json`, execute `npm ci`.

Mantenha suas duas variáveis Supabase existentes. Acrescente em `.env.local`:

```text
APP_URL=http://localhost:3000
```

Essa variável é somente o endereço do site, sem caminho, parâmetros ou credenciais. Se usar outra porta, substitua 3000 em todas as URLs deste documento. Não misture localhost e 127.0.0.1. Em uma futura implantação autorizada com HTTPS, use a origem exata do site em APP_URL; nenhuma implantação foi realizada nesta etapa.

Reinicie o terminal com `npm run dev`.

## 2. Configurar URLs no Supabase

No Dashboard do seu projeto, abra Authentication > URL Configuration (os nomes podem variar conforme a versão do painel).

**Site URL:**

```text
http://localhost:3000
```

**Redirect URLs / URLs de redirecionamento permitidas:**

```text
http://localhost:3000/admin/auth/confirm
```

Não é necessário permitir um curinga geral. A rota `/admin/redefinir-senha` é o destino interno após a validação, não precisa receber tokens diretamente e não é o Site URL.

## 3. Template recomendado para recuperar a senha

Em Authentication > Email Templates > Reset Password, configure o link do botão para:

```html
<a
  href="{{ .SiteURL }}/admin/auth/confirm?token_hash={{ .TokenHash }}&amp;type=recovery"
>
  Redefinir minha senha
</a>
```

O Site URL deve estar sem barra final para evitar caminho duplicado. Preserve as variáveis do template exatamente como acima. Não substitua TokenHash por uma chave do projeto e não copie tokens reais em código ou chat.

Com esse template, o site recebe o hash de recuperação, guarda-o em cookie HttpOnly de curta duração, remove o token da barra de endereço e aguarda o clique em **Continuar redefinição** antes de consumi-lo. Isso evita consumir o link no primeiro GET, por exemplo por uma checagem automática do e-mail.

O template padrão com `{{ .ConfirmationURL }}` também é suportado quando o pedido é iniciado pela opção Esqueci minha senha do site: o fluxo PKCE usa um verificador em cookie HttpOnly e troca o código de uso único por uma sessão. Nesse modo é necessário abrir o link no mesmo navegador e com o mesmo hostname usados na solicitação. O callback aceita apenas códigos identificados pelo SDK como recuperação.

Links antigos que já abrem a página inicial, links expirados ou já utilizados não são consertados retroativamente. Não cole tokens na página inicial. Faça uma nova solicitação pelo site depois de configurar as URLs/template e aguardar a liberação da cota.

## 4. Confirmar autorização administrativa

A conta existir em Authentication não basta para acessar o painel. Em Authentication > Users, copie o **UUID** da sua conta. No SQL Editor, confira:

```sql
select user_id
from public.studio_admins
where user_id = 'SUBSTITUA-PELO-UUID-DA-SUA-CONTA';
```

Se não houver linha e essa for a conta que você deseja autorizar como administradora, execute:

```sql
insert into public.studio_admins (user_id)
values ('SUBSTITUA-PELO-UUID-DA-SUA-CONTA')
on conflict do nothing;
```

Use o UUID, não o e-mail. Não desative RLS nem crie política de leitura/escrita geral. Não é necessário recriar tabelas ou executar o seed para esta correção.

O site verifica o usuário no Supabase Auth e consulta sua própria associação em studio_admins no servidor. As políticas permitem ler a própria associação e não permitem autoatribuir administração. Pedir um e-mail de recuperação não cria conta nem concede permissão; uma conta sem associação é recusada na redefinição administrativa e no painel.

## 5. Testar sem repetir e-mails

1. Aguarde a liberação da cota de e-mails do Supabase. Não altere limites para contornar o bloqueio.
2. Abra `http://localhost:3000/admin/login`.
3. Clique **Esqueci minha senha**.
4. Informe seu e-mail e clique uma única vez em **Enviar link de recuperação**. A resposta de sucesso é genérica para não revelar se um endereço está cadastrado.
5. Abra somente o link mais recente. Com o template recomendado, clique **Continuar redefinição** na página aberta.
6. Digite a nova senha duas vezes. Use pelo menos 12 caracteres e cumpra os requisitos adicionais de senha definidos no seu Supabase.
7. Clique **Salvar nova senha**. Após validar o link, a janela de recuperação do site dura dez minutos. O prazo de validade do e-mail é o configurado pelo Supabase.
8. Você será encaminhada ao login com a mensagem de senha atualizada. Entre com o e-mail administrativo e a nova senha.
9. Confira o painel e depois use Sair com segurança. A sessão de recuperação deste navegador é encerrada após salvar; o tratamento das demais sessões segue as regras do Supabase.

Se houver erro de confirmação das senhas, digite os dois campos novamente. O formulário não conserva senhas depois de uma tentativa.

Se aparecer erro de autorização, confira o UUID em studio_admins. Se aparecer link inválido, confira hostname/porta, APP_URL, template e se o link já foi utilizado. Se o pedido exigir CAPTCHA ou outra configuração do provedor, não desative a proteção: conclua a configuração correspondente no projeto antes de repetir.

## Segurança e testes executados

- Cookies de sessão e recuperação são HttpOnly, SameSite Lax e Secure em produção; dados de recuperação não ficam em localStorage.
- O callback remove parâmetros sensíveis da URL após recebê-los. As rotas administrativas têm cache privado/no-store e Referrer-Policy no-referrer. O log de requisições do Next ignora o callback; se você adicionar proxy, analytics ou logs próprios, não registre seus parâmetros.
- Não há senha padrão, service_role, alteração automática de studio_admins ou desativação de RLS.
- A solicitação tem uma pausa por endereço no processo e respeita as respostas de rate limit do Supabase. Esse controle local não substitui os limites distribuídos do provedor.
- Testes: políticas de senha e origem; fluxo local isolado com o SDK oficial e um simulador de protocolo Supabase, sem e-mails reais; PKCE/HttpOnly, token_hash sem consumo no GET, confirmação divergente, atualização, login novo, link reutilizado/expirado, bloqueio de conta não administradora e rate limit sem repetição automática. As políticas studio_admins também foram testadas em PostgreSQL local.
- O fluxo real no seu projeto e a entrega do e-mail ainda precisam ser testados por você depois de configurar as URLs e aguardar a cota. O agente não utilizou sua conta ou credenciais e não alterou o Dashboard Supabase.

Para repetir os testes isolados: `npm run build` e `npm run test:recovery`, com Chromium instalado. Eles iniciam um servidor local de teste na porta 3003, sem acesso ao Supabase real. Lint, build, tipos e demais testes são executados pelos scripts já existentes.

Nenhuma página pública, preço, galeria, CSS ou branch main foi alterada. Não houve deploy.
