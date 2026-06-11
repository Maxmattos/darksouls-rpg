# Estilo de Imagens — Campanha Dark Souls RPG

Documento de referência para gerar imagens no ChatGPT. Consultar **sempre** antes de escrever um prompt.

## Regra-mãe
- **LOCAL** → orientar a IA a usar a **referência oficial do lugar em Dark Souls** (ex.: "Majula oficial de Dark Souls II", "Undead Asylum oficial de Dark Souls").
- **PERSONAGEM / CRIATURA** → travar na **nossa arte própria** (ref. abaixo). NÃO usar o design oficial para sujeitos — só para o cenário.

## Estilo global
- Dark fantasy fotorrealista-pictórico (concept art de alta produção, à la Souls/Elden Ring). Levemente dessaturado.
- Paleta: interiores em sépia/âmbar quente de tocha e fogueira; exteriores e cenas oníricas em cinza-azulado frio.
- Luz: uma fonte dominante e dramática (chiaroscuro). Motivo recorrente: facho vindo de fresta no teto; tochas; fogueira; brasas e faíscas no ar.
- Sombra: pretos profundos, alto contraste, vinheta natural.
- Superfícies: pedra úmida e reflexiva, metal gasto, malha, couro, tecido esfarrapado, hera, musgo.
- Ambiente: bruma, arquitetura gótica em ruína, escala grandiosa e solitária.
- Humor: melancolia, decadência, mistério.
- Enquadramento: personagem full-body em retrato 2:3; ambiente em 16:9; objeto em 16:9 ou 1:1.

## Template de 3 camadas (todo prompt monta as três)
1. **SUJEITO** — lock na nossa arte + pose/ação.
2. **LOCAL** — referência oficial DS + iluminação.
3. **ESTILO** — bloco global acima (resumido) + enquadramento/aspect.

Reforço final recomendado: *"concept art dark fantasy, fotorrealista-pictórico, iluminação chiaroscuro, dessaturado, alto detalhe."*
Negative (se a ferramenta aceitar): cores vivas/saturadas, cartoon, anime, aspecto limpo/novo, luz plana, fundo branco.

## Organização de pastas
- **Gerais e recorrentes** (PCs, NPCs-âncora) → `imagens/`.
- **Específicas de uma sessão** (cenas, momentos) → `sessoes/sessãoXX.../`.
- O layout atual já segue essa lógica.

## Locks (com o arquivo de referência)

**Gerais — `imagens/`**
| Sujeito | Arquivo | Lock |
|---|---|---|
| **Marin** | marin.png | Menino de cabelo prateado, cachecol azul, armadura leve de couro+placa, adaga, ar melancólico |
| **Zarkov** | zarkov.png | Encapuzado de negro, cabelo prateado ondulado, rosto pálido e magro, duas adagas de parry, mão pingando, broches em estrela |
| **Drakar** | drakar.png | Armadura negra de escamas/placas, cabelo escuro, capa esfarrapada, espada longa, eclipse/sol negro ao fundo |
| **Elvyra** | elvyra.png | Rosto jovem andrógino, cabelo escuro curto e desgrenhado, cicatriz fina, brinco ornamentado, placas escurecidas com filigrana de cobre e gravações em cruz, pano vermelho |
| **Rendal** | rendal.png | Capuz e panos esfarrapados sobre placa gasta, rosto oculto, cinto de fivelas/argolas |
| **Serelyn** | serelyn.png | Cabelos castanhos longos ondulados, máscara/venda de metal ornamentada sobre os olhos, manto e capa negros, chama viva na palma, faíscas, serena |
| **Lenigrast** | lenigrast.png | Ferreiro colossal de pele esverdeada (meio-gigante), barba grisalha, faixa na testa, avental/peitoral de couro, botas com tachas, bolsa de couro, martelo e bigorna |

**Cenas da Sessão 1 — `sessoes/sessão01_01_06_2026/`**
| Sujeito | Arquivo | Lock |
|---|---|---|
| **Hollow Soldier** | 05.1_hollow_soldier_besta · 05.2_hollow_soldier_halabarda · 05.3_hollow_soldier_machado | Corpo descarnado, elmo-domo rachado, malha + correias, olhos laranja. Armas: besta / alabarda / machado |
| **Asylum Demon** | 07_asylum_demon | CUSTOM (chifres/galhada, fauce, barriga esverdeada, clava). Não usar o oficial. Reusado na Sessão 2 |
| **Fogueira / porta do asilo** | 06_asylum_door | Fogueira com espada, pátio gótico, escadaria, estátuas, hera |
| **Chave + "A"** | 02_key_A | Chave enferrujada + "A" em brasa sobre estopa, facho único |
| **Drangleic onírica** | 00_drangleic_spirit | Metrópole gótica vasta, cinza-azulado (abertura — NÃO é Majula) |
| **Corredores do asilo** | 03_undead_asylum_corredor1 · 04_corredor_batalha | Vaultas góticas, tocha, hollow ao fundo, gate gradeado |
