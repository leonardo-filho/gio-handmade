# Apresentação de sábado (28/11/2026): como subir as 4 versões

Roteiro para o Leo e para o Claude Code do computador de casa. Um script baixa as 4 versões da loja, instala, sobe as 4 juntas e mostra uma página que coloca as 4 lado a lado, em moldura de celular ou de computador, para a Gio escolher a base.

Para pedir ajuda ao Claude de lá, basta escrever:

```text
Siga o docs/APRESENTACAO.md e suba as 4 versões
```

> Nada aqui publica o site. A `main` (que publica na Vercel) não muda, e o pagamento das 4 versões está em modo demonstração: nenhuma compra é cobrada.

## Antes de começar

- **Node 22 ou mais novo.** Conferir com `node -v`. Se faltar, instalar a versão LTS em https://nodejs.org e abrir um terminal novo.
- **git.** Conferir com `git --version`. No Windows, instalar pelo https://git-scm.com (já vem com o login do GitHub pelo navegador). No Mac, `xcode-select --install`.
- **Acesso ao GitHub** do repositório `leonardo-filho/gio-handmade` (login do Leo).
- **Internet na primeira vez** e uns **4 GB livres** em disco (cada versão tem a própria pasta `node_modules`, de cerca de 800 MB).
- **Memória:** cada versão no ar usa perto de 1 GB. Com 8 GB de RAM ou mais vai tranquilo; com menos, feche o resto antes.
- **Na máquina do Leo, antes:** as branches precisam estar no GitHub. Do computador de trabalho, uma vez:

  ```bash
  git push origin apresentacao/base apresentacao/v1-claude-vitrine apresentacao/v2-claude-peca-em-foco apresentacao/v3-argon apresentacao/v4-astra
  ```

## Comandos

Num terminal (no Windows, PowerShell ou Terminal), dentro da pasta onde o projeto vai morar:

```bash
git clone https://github.com/leonardo-filho/gio-handmade.git
cd gio-handmade
git switch apresentacao/base
node scripts/apresentacao.mjs
```

Para rodar de novo outro dia (por exemplo, no sábado de manhã), basta, de dentro de `gio-handmade`:

```bash
git pull
node scripts/apresentacao.mjs
```

O script reaproveita as pastas, traz o que mudou no GitHub e pula o `npm ci` da versão que já está instalada.

Opções úteis:

| Opção | Para quê |
|---|---|
| `--porta-inicial 3201` | usar as portas 3201 a 3204 quando 3001 a 3004 estiverem ocupadas |
| `--sem-instalar` | não rodar `npm ci` (quando as dependências já estão lá) |
| `--reinstalar` | rodar `npm ci` de novo em todas, se uma versão reclamar de módulo faltando |
| `--abrir` | abrir a página de comparação no navegador quando tudo subir |
| `--ajuda` | listar as opções |

## O que esperar

O script mostra 5 passos:

1. `git fetch origin`, para trazer a última versão das branches.
2. Cria a pasta `gio-apresentacao`, ao lado do clone, com uma pasta para cada versão:

   ```text
   gio-handmade/                 o clone, na branch apresentacao/base
   gio-apresentacao/
     v1-claude-vitrine/          apresentacao/v1-claude-vitrine
     v2-claude-peca-em-foco/     apresentacao/v2-claude-peca-em-foco
     v3-argon/                   apresentacao/v3-argon
     v4-astra/                   apresentacao/v4-astra
   ```

3. `npm ci` em cada versão. A primeira baixa tudo e leva alguns minutos; as outras saem do cache e são mais rápidas. A cada 20 segundos aparece "ainda instalando". Não precisa cancelar.
4. Sobe as 4 versões nas portas 3001 a 3004. Cada linha do servidor vem marcada com a versão, por exemplo `[v2 Provador]`. A primeira abertura compila o site e leva de 30 segundos a 2 minutos por versão. O script também abre a Loja e o Top Maya uma vez, para o primeiro clique da Gio não esperar.
5. Mostra os 4 links, se cada um está no ar, e o link da página de comparação.

**Deixe a janela do terminal aberta durante a apresentação.** Ctrl+C encerra as 4 versões.

## A página de comparação

Abrir o arquivo `apresentacao.html`, na raiz do clone, no Chrome ou no Edge (dois cliques no arquivo, ou colar no navegador o link `file:///...` que o script mostra no fim).

- **Celular / Computador:** troca a moldura de todas (celular de 390 x 844 ou tela de 1440 x 900, encolhidas para caber).
- **Início / Loja / Top Maya:** leva as 4 versões para a mesma página. Dentro de cada moldura dá para navegar à vontade.
- **Recarregar:** volta as 4 para a página escolhida.
- **Abrir em tela cheia:** abre aquela versão numa aba nova, do tamanho da tela.
- Se uma versão ainda não subiu, a moldura mostra "Esperando a versão N" e se atualiza sozinha quando ela responder.
- Se o script subiu em outras portas, acrescentar `?porta=3201` no fim do endereço da página (o link que o script mostra já vem certo).

Dica para a Gio: tela cheia no navegador (F11 no Windows; Ctrl+Cmd+F no Mac) e, para ver uma versão com calma, "Abrir em tela cheia".

## As 4 versões

| Versão | Nome | A ideia em uma linha | Porta | Branch |
|---|---|---|---|---|
| 1 | Vitrine | A mais parecida com as lojas que a Gio admira, com o "Ver de perto" para percorrer o bordado com o dedo ou o mouse | 3001 | `apresentacao/v1-claude-vitrine` |
| 2 | Provador | A cliente digita busto, cintura e quadril e vê o tamanho acender na tabela, com manequim e "monte o look" | 3002 | `apresentacao/v2-claude-peca-em-foco` |
| 3 | Ateliê de Luz e Relevo | Lupa com luz em qualquer peça e o Top Maya em 3D, com as 2.500 miçangas, para girar com o dedo | 3003 | `apresentacao/v3-argon` |
| 4 | Lookbook | Cada peça contada em poucas telas cheias, com o bordado se aproximando sozinho e o COMPRAR sempre à mão | 3004 | `apresentacao/v4-astra` |

As 4 fecham a compra dentro do site (dados, medidas, CEP, sinal de 50% e o pedido no WhatsApp da Gio). O resumo de cada uma está em `docs/VERSAO.md` da branch dela. A 3 foi feita pelo Gemini (Argon); a 1, a 2 e a 4 pelo Claude (a 4 era do Codex, mas o login dele estava revogado).

## O que a Gio precisa decidir no sábado

1. **Qual versão é a base.** Dá para misturar: a base de uma com uma ideia de outra (por exemplo, o provador da 2 dentro da 1).
2. **Pagamento.** Nuvemshop (o site monta o carrinho pela Storefront API e a cliente paga no checkout da Nuvemshop; as medidas vão junto com o item) ou Mercado Pago dentro do site (Pix e cartão, com o sinal de 50%). Nas 4 versões os dois ainda estão em modo demonstração; a troca é em `src/lib/checkout.ts`.
3. **Foto do topo** da página inicial.
4. **Tamanhos das peças de pronta entrega.** O campo `tamanho` está vazio no catálogo (`src/data/produtos.ts`), então as etiquetas mostram só "Pronta entrega", sem P ou M.
5. **Faixa "Frete grátis acima de R$ 600".** A versão 1 aplica a regra no checkout; a 2 e a 4 tiraram a faixa porque o checkout delas cobra o frete pelo CEP; a 3 mostra a faixa, mas o checkout dela ainda cobra o frete. Se a promessa continuar, o checkout da versão escolhida precisa zerar o frete acima de R$ 600.
6. **Textos de cuidados, medidas e sinal**, em rascunho em `src/data/conteudo-loja.ts`.

Se sobrar tempo, vale perguntar também:

- **Parcelamento de pedido com peças diferentes:** hoje vale o menor parcelamento entre elas (Top Maya em 5x com o Headpiece Luna em 3x sai "em até 3x"; com o Chocker, que é à vista, sai à vista).
- **"Até 12x com juros no link"** saiu da versão 4, porque o checkout no site só faz parcelado sem juros.
- **Look do Top Maya** na versão 2 (Saia Giô e Headpiece Luna, escolhidos à mão) e as 3 fotos de campanha que entram nas pranchas da versão 4.

## Problemas comuns

**"A porta 3001 já está em uso".** Outra janela já está rodando o site, ou outro programa usa a porta. Feche a outra janela, ou rode com outras portas:

```bash
node scripts/apresentacao.mjs --porta-inicial 3201
```

Para ver quem ocupa a porta: no Windows, `netstat -ano | findstr :3001` e depois `taskkill /PID <número> /F`; no Mac ou Linux, `lsof -i :3001`.

**`npm ci` lento ou parado.** A primeira instalação baixa bastante coisa; antivírus no Windows também deixa mais lento. Enquanto aparecer "ainda instalando", está andando. Se cair a internet, rode o script de novo. Se uma versão reclamar de módulo faltando depois, rode com `--reinstalar`.

**Login do GitHub.** Se o `git clone` pedir login: no Windows abre uma janela do navegador para entrar com a conta do Leo. No Mac ou Linux, o jeito mais simples é o GitHub CLI: `gh auth login` e depois `gh auth setup-git`. "Repository not found" quer dizer que a conta logada não tem acesso ao repositório.

**"Não achei a branch apresentacao/..."** As branches ainda não foram para o GitHub. Rodar o `git push` da seção "Antes de começar" no computador de trabalho e, aqui, rodar o script de novo.

**Firewall do Windows.** Na primeira vez o Windows pode perguntar se o Node.js pode usar a rede. Para abrir no próprio computador tanto faz: "Permitir" (rede privada) ou "Cancelar" funcionam.

**PowerShell diz que "a execução de scripts foi desabilitada"** ao digitar `npm`. O script não depende disso (ele chama o npm pelo cmd). Para usar o npm à mão, digite `npm.cmd` no lugar de `npm`.

**Uma versão não subiu.** As outras continuam no ar. Leia as linhas marcadas com o nome dela (por exemplo `[v3 Ateliê de Luz e Relevo]`). Se for módulo faltando, rode com `--reinstalar`. Se a página inicial dela responder 404 (aconteceu uma vez nos testes, com o cache do Next), o script já limpa o cache daquela versão e sobe de novo sozinho; se continuar, apague a pasta `.next` dentro da pasta dela e rode de novo.

**"A pasta ... já existe, mas não é uma cópia deste repositório"** ou **"a branch mudou no GitHub de um jeito que não dá para só avançar".** Apague a pasta indicada dentro de `gio-apresentacao` e rode de novo: o script baixa aquela versão outra vez.

**A página de comparação fica em "Esperando a versão".** O script não está rodando, ou subiu em outras portas (use o link que ele mostra, com `?porta=`).

**Abrir no celular da Gio pela rede de casa** pode não funcionar: em modo de desenvolvimento o Next bloqueia partes do site fora do `localhost`. A moldura de celular da página de comparação faz esse papel.
