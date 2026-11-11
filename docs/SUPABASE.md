# Ativar o Supabase — passos indispensáveis

Nenhum projeto externo foi criado ou alterado pelo agente. O banco, Auth e Storage foram preparados e as políticas SQL testadas em PostgreSQL local. O funcionamento real na sua conta continua dependendo dos passos abaixo.

## 1. Criar o projeto

Entre em https://supabase.com/ e crie um projeto. Guarde a senha do banco em local seguro. Não envie senhas, chaves privilegiadas ou tokens no chat. Use um projeto novo para esta primeira configuração; em um projeto compartilhado, revise políticas e tabelas existentes antes de executar as migrações.

## 2. Preparar banco e armazenamento

No SQL Editor, abra uma consulta e execute **cada arquivo inteiro**, nesta ordem:

1. `supabase/schema.sql` — tabelas de conteúdo, administradores, marketing, pedidos e portfólio.
2. `supabase/migrations/002_private_and_hardening.sql` — prompts privados, privilégios mínimos, bloqueio de prompts no conteúdo público, consentimento obrigatório no banco e bucket privado.
3. `supabase/seed-public.sql` — inicializa o catálogo com as 29 referências aprovadas e os preços preservados. Não substitui um catálogo já preenchido.

Os scripts são repetíveis e não apagam coleções ou pedidos. A migração impede chaves com “prompt” dentro do JSON público. Se ela recusar um banco que já contenha esses campos, faça backup e transfira os prompts para a tabela privada antes de tentar novamente; não desative a proteção para concluir a instalação.

O bucket `portfolio` é público, reservado a imagens autorizadas para demonstração. Os buckets `studio-private` e `portfolio-staging` são privados. Não acrescente políticas genéricas de leitura pública a esse bucket. As políticas assumem que não há outras políticas permissivas globais que liberem objetos indiscriminadamente.

## 3. Autorizar sua conta administrativa

Em Authentication > Users, crie ou convide sua conta usando seu próprio e-mail. Defina uma senha forte no fluxo seguro do Supabase. Desative cadastro público de novos usuários nas configurações de Auth.

Copie o UUID da conta criada. No SQL Editor, substitua o texto abaixo pelo UUID e execute:

```sql
insert into public.studio_admins (user_id)
values ('COLE-O-UUID-DA-SUA-CONTA-AQUI')
on conflict do nothing;
```

Ter uma conta no Auth não basta: apenas quem está nessa tabela é administrador. O usuário comum não consegue adicionar a si próprio. Revogue o acesso removendo a associação pelo SQL Editor; guarde ao menos uma conta administrativa válida.

Configure limites de tentativa de login e recuperação no Supabase. Recuperação de acesso é feita pela administração do projeto; o site não simula envio de e-mail de redefinição. Antes da publicação, configure Site URL e URLs autorizadas com o domínio real. MFA não foi implementado nesta etapa.

## 4. Configurar duas variáveis

Em desenvolvimento, copie `.env.example` para `.env.local`, na pasta do projeto, e preencha:

```text
SUPABASE_URL=URL_DO_SEU_PROJETO
SUPABASE_ANON_KEY=CHAVE_PUBLICAVEL_OU_ANON
```

Use a URL e a chave **publicável/anon** do projeto. Não use `service_role` ou `sb_secret_*`; o código recusa chaves privilegiadas reconhecíveis. Não coloque os valores em `NEXT_PUBLIC_*`, documentação, commits ou chat. `.env.local` está ignorado pelo Git.

Reinicie o servidor e abra `/admin/login`. Em uma futura implantação autorizada na Vercel, configure essas mesmas duas variáveis no painel da hospedagem. No ambiente de nuvem com rede restrita, permita somente o hostname do seu projeto Supabase nas configurações de saída.

## 5. Importar os prompts privados

O arquivo `.private/prompts/import.json` foi preservado no ambiente de trabalho e **não é enviado ao GitHub**. Ele contém os 15 prompts das quatro coleções. Guarde uma cópia em local privado; um ZIP do GitHub não contém essa pasta. Os ZIPs originais fornecidos por você também devem ser guardados.

No site, entre como administradora e acesse Painel > Prompts privados. Selecione o arquivo privado JSON para importação. Registros existentes são preservados; é possível editar ou excluir cada prompt depois. Formato para recriar um arquivo de importação privado a partir dos seus originais:

```json
{
  "items": [
    {
      "photo_id": "IDENTIFICADOR-DO-MODELO",
      "prompt": "SEU-TEXTO-PRIVADO",
      "guidance": "ORIENTACOES-OPCIONAIS"
    }
  ]
}
```

Os IDs estão nos arquivos públicos das coleções (`rn-01`, `inf-01`, `mes-01`, `ani-01` etc.). Importação não gera imagens e não publica conteúdo. O banco protege prompts com RLS, e as páginas/ações verificam a conta no servidor. Não cadastre prompts em títulos, descrições ou legendas públicas.

## 6. Configurar os canais e testar

O perfil informado por você já está configurado como Instagram `@encantonoretrato.studioia`, com links de perfil e de conversa. Isso não autentica nem verifica a conta na Meta. Confirme no seu navegador que o destino é o perfil correto.

Em Textos e redes, cadastre o link oficial do Facebook e o endereço de conversa do Messenger fornecido pela sua Página. Nenhum link de Facebook foi inventado. Não há WhatsApp, telefone pessoal ou endereço residencial.

Teste com sua conta: login, logout, editar/salvar/recarregar um título, reordenar e substituir uma imagem, importar/editar um prompt e registrar um pedido com consentimento. Use outra conta sem permissão e uma janela anônima para confirmar que painel, prompts, marketing e pedidos ficam bloqueados. Esses testes em Supabase real ainda precisam ser executados na sua conta.

## Limites e cuidados

Uploads aceitam JPEG, PNG e WebP até 5 MB e 40 megapixels, sem animação. O servidor decodifica o arquivo, corrige orientação e remove metadados EXIF/GPS antes de armazenar; não redimensiona a imagem. Arquivos do acervo existente não foram alterados. O navegador envia o arquivo diretamente ao bucket temporário privado por uma URL assinada e limitada ao arquivo. O servidor valida/limpa a imagem e só então grava no portfólio público; assim o upload de 5 MB não depende do limite de corpo das Functions Vercel. Testar este fluxo no Supabase real ainda é necessário. Limpe periodicamente objetos abandonados de `portfolio-staging` (por exemplo, uploads interrompidos há mais de 24 horas) pelo Dashboard; não remover uploads em andamento.

Remover uma imagem da galeria remove a referência, preservando o arquivo original no Storage. Para exclusão definitiva, confira referências e autorizações antes de remover pelo Dashboard. Pedidos podem ser apagados no painel. Defina seu prazo de retenção e rotina de exclusão antes de receber dados de clientes.

Os prompts saíram da versão atual do repositório, mas permanecem em commits antigos. Se o repositório for público, revisar sua privacidade ou autorizar uma limpeza específica do histórico é necessário para restringir esse acesso histórico. Nenhum force push ou alteração da main foi realizado.
