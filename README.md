# Pesquisa de Satisfação · Conexão GAV | ADM Comercial

Sistema de avaliação por sala para o evento Conexão GAV. Feito para ser publicado
gratuitamente (GitHub Pages) e usar o Google Sheets como banco de dados — sem
precisar de servidor, hospedagem paga ou conhecimento técnico para operar no
dia do evento.

## O que tem aqui

| Arquivo | O que é |
|---|---|
| `index.html` | A página que o **avaliador** (participante) acessa para responder a pesquisa |
| `admin.html` | O **painel do palestrante**: ativa/desativa a sala em avaliação e mostra o dashboard de resultados |
| `apps-script.gs` | O "backend" — código que roda dentro do Google Sheets e conecta os dois HTMLs à planilha |

**Como funciona, em resumo:** o palestrante abre `admin.html`, ativa a sala onde
está apresentando (ex: "Muro Alto"). Só quem acessa `index.html` nesse momento
vê o formulário — automaticamente, sem escolher nada, sem risco de marcar a
sala errada. Cada resposta é gravada na planilha do Google, junto com a sala e
o e-mail de quem respondeu (pra não deixar a mesma pessoa responder duas vezes
a mesma sala). O admin também tem uma aba de **Dashboard** com notas médias,
gráficos por sala e exportação em CSV.

Este guia assume que é a **primeira vez** que você faz algo assim — vai
funcionar mesmo sem nenhuma experiência técnica. São ~20 minutos, feitos uma
única vez antes do evento.

---

## Parte 1 — Criar a planilha no Google Sheets

1. Acesse [sheets.google.com](https://sheets.google.com) e faça login com sua conta Google.
2. Clique em **Planilha em branco** para criar uma nova.
3. Dê um nome a ela, por exemplo **"Conexão GAV — Respostas"** (clique em "Planilha sem título" no canto superior esquerdo para renomear).
4. Deixe essa aba aberta — vamos usá-la no próximo passo.

## Parte 2 — Colar o código do Apps Script

1. Na planilha, vá no menu **Extensões → Apps Script**. Uma nova aba do navegador vai abrir, com um editor de código.
2. Vai ter um código padrão escrito ali (algo como `function myFunction() {}`). **Apague tudo.**
3. Abra o arquivo `apps-script.gs` (que está junto com este README), copie **todo** o conteúdo, e cole no editor do Apps Script.
4. Bem no topo do código tem esta linha:
   ```js
   var ADMIN_PIN = 'GAV2026';
   ```
   Troque `GAV2026` pela senha que você quer usar para entrar no painel do admin. Pode ser qualquer coisa, ex: `'MinhaSenh4'`.
5. Clique no ícone de **disquete** (💾) ou aperte `Ctrl+S` (`Cmd+S` no Mac) para salvar.
6. No topo, ao lado do botão "Executar" (▶), tem uma caixinha de seleção de função. Clique nela e escolha **`setupSalas`**.
7. Clique no botão **Executar** (▶).
8. Vai aparecer uma janela pedindo autorização. Clique em **Revisar permissões** → escolha sua conta → se aparecer um aviso "O Google não verificou este app", clique em **Avançado** → **Acessar [nome do projeto] (não seguro)** → **Permitir**.
   - *Isso é normal: é o próprio Google avisando que é um script seu, não de terceiros. Como você mesmo escreveu/colou o código, pode confiar.*
9. Espere a execução terminar (aparece "Execução concluída" embaixo). Volte na aba da planilha — deve ter surgido uma nova aba chamada **"Salas"**, já com as 25 salas do evento listadas.

## Parte 3 — Publicar o Apps Script como site (Web App)

1. Ainda no editor do Apps Script, clique no botão azul **Implantar** (canto superior direito) → **Nova implantação**.
2. Clique no ícone de engrenagem ⚙️ ao lado de "Selecionar tipo" → escolha **App da Web**.
3. Preencha:
   - **Descrição**: "Conexão GAV" (ou o que quiser)
   - **Executar como**: **Eu** (seu e-mail já vem selecionado)
   - **Quem pode acessar**: **Qualquer pessoa**
4. Clique em **Implantar**.
5. Vai pedir autorização de novo (mesmo processo do passo 8 da Parte 2) — autorize.
6. Vai aparecer uma caixa com **URL do app da Web**, algo como:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
   **Copie essa URL inteira** — cole num bloco de notas por enquanto, você vai precisar dela duas vezes no próximo passo.

## Parte 4 — Colar a URL nos arquivos HTML

1. No seu computador, abra o arquivo `index.html` com o **Bloco de Notas** (Windows) ou **TextEdit em modo texto simples** (Mac) — clique com botão direito no arquivo → "Abrir com" → escolha o editor de texto.
2. Use **Ctrl+F** (ou Cmd+F) para procurar por `COLE_AQUI_A_URL_DO_APPS_SCRIPT`.
3. Você vai achar esta linha:
   ```js
   const GOOGLE_SCRIPT_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";
   ```
   Apague só a parte `COLE_AQUI_A_URL_DO_APPS_SCRIPT` (mantendo as aspas) e cole a URL que você copiou na Parte 3. Deve ficar assim:
   ```js
   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
4. Salve o arquivo (Ctrl+S), mantendo o nome `index.html` e o formato "somente texto" (não deixe o Bloco de Notas trocar para `.txt`).
5. Repita os passos 1 a 4 no arquivo `admin.html` — a mesma URL, no mesmo formato de linha.

**Atenção:** é a mesma URL nos dois arquivos. Se um dia você reimplantar o Apps Script e gerar uma URL nova, tem que atualizar nos dois.

## Parte 5 — Publicar o site (GitHub Pages, gratuito)

1. Crie uma conta em [github.com](https://github.com) caso ainda não tenha (é gratuito).
2. Clique no **+** no canto superior direito → **New repository**.
3. Preencha:
   - **Repository name**: `conexao-gav-pesquisa` (ou o nome que preferir, sem espaços)
   - Marque a opção **Public**
   - Clique em **Create repository**
4. Na página que abrir, clique no link **uploading an existing file**.
5. Arraste os três arquivos para a caixa: `index.html`, `admin.html` e `apps-script.gs` (esse último é só backup, não é obrigatório subir).
6. Role para baixo e clique em **Commit changes**.
7. Vá na aba **Settings** do repositório (menu superior) → no menu da esquerda clique em **Pages**.
8. Em **Build and deployment → Source**, selecione **Deploy from a branch**.
9. Em **Branch**, selecione **main** e a pasta **/ (root)**, depois clique em **Save**.
10. Espere 1 a 2 minutos e recarregue a página. Vai aparecer uma faixa verde com o link do site, parecido com:
    ```
    https://seu-usuario.github.io/conexao-gav-pesquisa/
    ```

## Parte 6 — Seus dois links finais

- **Link do avaliador** (manda pros participantes, QR code, etc.):
  `https://seu-usuario.github.io/conexao-gav-pesquisa/`
- **Link do admin** (só você/o palestrante usa):
  `https://seu-usuario.github.io/conexao-gav-pesquisa/admin.html`

Dica: gere um QR code do link do avaliador (qualquer gerador gratuito de QR
code na internet, ex. buscar "gerador de qr code grátis") e deixe exposto na
sala.

## Parte 7 — Testando antes do evento

1. Abra o link do **admin**, digite o PIN, e ative uma sala de teste (ex. "Cupe").
2. Em outra aba (ou no celular), abra o link do **avaliador** — o formulário deve aparecer sozinho, mostrando "Cupe".
3. Preencha e envie uma resposta de teste.
4. Volte no admin → aba **Dashboard** → deve aparecer 1 resposta.
5. Abra a planilha do Google Sheets → aba **Respostas** → confirme que a linha apareceu.
6. Se abrir o avaliador de novo com o mesmo e-mail, deve aparecer o aviso de que já respondeu essa sala.
7. Depois do teste, pode apagar essa linha de teste direto na planilha (clique com botão direito na linha → Excluir linha).

## Uso no dia do evento

1. Antes de cada apresentação, o palestrante abre `admin.html` no celular ou notebook, digita o PIN (fica salvo no navegador, não precisa digitar de novo) e toca na sala correspondente para ativá-la.
2. Os participantes acessam o link do avaliador (QR code) e avaliam.
3. Ao final da apresentação, o palestrante toca em **"Encerrar avaliação"** ou já toca direto na próxima sala (isso desativa a anterior automaticamente).
4. A qualquer momento dá pra abrir a aba **Dashboard** para ver notas médias, gráfico por sala e exportar CSV.

## Problemas comuns

- **"Página ainda não conectada à planilha"**: esqueceu de colar a URL do Apps Script no `index.html` ou `admin.html` (Parte 4).
- **PIN incorreto**: confira a variável `ADMIN_PIN` no topo do `apps-script.gs` — é exatamente o que está lá (com maiúsculas/minúsculas).
- **Mudei o código do Apps Script e não fez efeito**: depois de editar, é preciso ir em **Implantar → Gerenciar implantações → ícone de lápis (editar) → em "Versão" escolha "Nova versão" → Implantar**. Só salvar o código não atualiza a URL já publicada.
- **Sala não aparece pro avaliador**: confirme no admin que alguma sala está mesmo ativada (o card "Sala em avaliação agora" não pode estar vazio).
- **Quero trocar os nomes das salas**: edite direto a coluna A da aba **Salas** na planilha — não precisa mexer em nenhum código.
