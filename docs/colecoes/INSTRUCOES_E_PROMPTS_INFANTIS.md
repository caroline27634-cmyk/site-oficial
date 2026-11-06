# Encanto no Retrato Studio IA — Ensaios Infantis

As quatro imagens são **demonstrativas, geradas por IA**, com crianças fictícias. Foram recortadas de uma composição 2×2; não são originais individuais de alta resolução. Não ampliar artificialmente nem prometer fidelidade exata ao personalizar. Solicitar versões individuais maiores antes da publicação definitiva, se necessário.

## Metadados

| Arquivo | Título | Categoria | Descrição |
|---|---|---|---|
| INF_01_Doce_Encanto.jpg | Doce Encanto | Infantis / Ensaios infantis | Um retrato clássico e delicado, com vestido rendado, tons creme e iluminação suave de estúdio. |
| INF_02_Jardim_das_Fadas.jpg | Jardim das Fadas | Infantis / Ensaios infantis | Um jardim encantado de flores rosadas, asas luminosas e borboletas douradas. |
| INF_03_Pequeno_Aviador.jpg | Pequeno Aviador | Infantis / Ensaios infantis | Uma aventura vintage com roupa de aviador, avião de madeira e cenário de viagem. |
| INF_04_Reino_dos_Sonhos.jpg | Reino dos Sonhos | Infantis / Ensaios infantis | Um pequeno príncipe diante de um castelo de conto de fadas ao pôr do sol. |

## Prompts de reprodução (modelos; adaptar ao cliente)

**Orientação comum:** Usar a foto enviada pelo responsável como referência de identidade da criança, com consentimento. Preservar características faciais, idade aparente, tom de pele, cabelo e expressão natural. Alterar principalmente figurino, iluminação e cenário. Não copiar a identidade da criança demonstrativa. Retrato fotográfico vertical, luz profissional, anatomia natural, sem texto, sem marca-d'água. Resultado pode variar; conferir identidade e artefatos antes da entrega.

1. **Doce Encanto:** Retrato profissional de estúdio infantil, vestido elegante de renda creme e laço de tecido no cabelo, fundo bege claro com flores suaves, luz difusa quente, pose natural sorridente, profundidade de campo rasa, estética fine art realista.
2. **Jardim das Fadas:** Retrato fotográfico infantil em jardim encantado com flores rosas, asas de fada translúcidas e luminosas, borboleta dourada flutuando à frente, vestido rosa com flores, brilho sutil e luz cinematográfica de fim de tarde, fantasia fotorrealista.
3. **Pequeno Aviador:** Retrato fotográfico infantil com capacete vintage de aviador e óculos de proteção, jaqueta marrom e cachecol creme, sentado com segurança em cenário de avião de madeira decorativo, mapa e globo ao fundo, iluminação quente, estilo editorial realista.
4. **Reino dos Sonhos:** Retrato infantil de príncipe de conto de fadas, capa azul-escura com detalhes dourados e coroa leve, castelo de fantasia ao fundo, flores discretas, luz dourada do pôr do sol, estilo cinematográfico fotorrealista.

## Instruções ao Codex

- Trabalhar na branch `desenvolvimento-galeria`; preservar design, cores, fontes, preços, rotas, categorias e referências existentes.
- Conferir o identificador real da categoria **Infantis** no código e associar as quatro imagens a ela, sem criar categoria duplicada.
- Cadastrar títulos, descrições e a indicação visível de imagem demonstrativa gerada por IA.
- Manter filtros, ampliação, setas e CTA **Quero um ensaio assim**.
- Se o tamanho ou a resolução não atenderem ao padrão do site, manter como prévia e informar que versões individuais em alta resolução são necessárias.
- Guardar prompts como documentação interna, sem exibi-los publicamente nem incluir dados pessoais de clientes no repositório.
- Testar build/lint e relatar resultados; não publicar nem alterar `main` sem autorização.
