# Design e Balanceamento de Encontros (D&D 5e)

Baseado no sistema de orçamento de XP do Guia do Mestre (DMG).

## Passo 1 — Limiar de XP por jogador e por nível

Some o limiar de cada jogador do grupo para obter o limiar total do grupo em cada dificuldade.

| Nível | Fácil | Médio | Difícil | Mortal |
|---|---|---|---|---|
| 1 | 25 | 50 | 75 | 100 |
| 2 | 50 | 100 | 150 | 200 |
| 3 | 75 | 150 | 225 | 400 |
| 4 | 125 | 250 | 375 | 500 |
| 5 | 250 | 500 | 750 | 1100 |
| 6 | 300 | 600 | 900 | 1400 |
| 7 | 350 | 750 | 1100 | 1700 |
| 8 | 450 | 900 | 1400 | 2100 |
| 9 | 550 | 1100 | 1600 | 2400 |
| 10 | 600 | 1200 | 1900 | 2800 |
| 11 | 800 | 1600 | 2400 | 3600 |
| 12 | 1000 | 2000 | 3000 | 4500 |
| 13 | 1100 | 2200 | 3400 | 5100 |
| 14 | 1250 | 2500 | 3800 | 5700 |
| 15 | 1400 | 2800 | 4300 | 6400 |
| 16 | 1600 | 3200 | 4800 | 7200 |
| 17 | 2000 | 3900 | 5900 | 8800 |
| 18 | 2100 | 4200 | 6300 | 9500 |
| 19 | 2400 | 4900 | 7300 | 10900 |
| 20 | 2800 | 5700 | 8500 | 12700 |

Exemplo: grupo de 4 jogadores nível 5 → limiar médio total = 500 x 4 = 2000 XP.

## Passo 2 — Some o XP base de cada monstro

Cada criatura tem um valor de XP fixo associado ao seu CR (tabela no Manual dos Monstros). Somar o XP de todos os monstros do encontro.

## Passo 3 — Aplique o multiplicador por número de inimigos

O XP total dos monstros é multiplicado conforme quantos inimigos aparecem no encontro (isso reflete a ação econômica extra que vários inimigos têm contra o grupo):

| Número de monstros | Multiplicador |
|---|---|
| 1 | x1 |
| 2 | x1.5 |
| 3-6 | x2 |
| 7-10 | x2.5 |
| 11-14 | x3 |
| 15+ | x4 |

Ajuste o multiplicador uma faixa para baixo se o grupo tiver mais de 5 jogadores, ou uma faixa para cima se tiver menos de 3.

## Passo 4 — Compare com o limiar do grupo

O "XP ajustado" (XP total x multiplicador) deve ficar dentro da faixa de dificuldade desejada. Se passar muito de "mortal", o encontro deve ter uma saída tática (fuga, terreno, aliados) ou ser reduzido.

## Fatores ambientais (ajustam a dificuldade percebida sem mudar a matemática)

- **Terreno difícil ou vertical** aumenta a dificuldade tática mesmo com XP igual.
- **Visibilidade reduzida** (escuridão, neblina) favorece emboscadas e furtividade.
- **Aliados do grupo** (contratados, invocações) efetivamente aumentam o "tamanho do grupo" para fins de ritmo, mas não entram no cálculo de XP do grupo.
- **Recursos já gastos** (PV, magias, itens consumíveis) tornam um encontro "médio" mais perigoso se for o terceiro do dia — regra geral: um grupo aguenta ~2-3 encontros médios/difíceis por dia de aventura antes de precisar descansar.

## Encontros não-combate

Nem todo encontro precisa de XP. Encontros sociais e de exploração também têm dificuldade:

- **Social**: definir a CD de persuasão/engano/intimidação com base na disposição inicial do NPC (hostil CD 20+, neutro CD 15, favorável CD 10) e nas consequências de falha (não travar a história, mas tornar o caminho mais difícil).
- **Exploração**: armadilhas e desafios de ambiente usam CD por nível de perigo (ver `references/masmorras.md`).
