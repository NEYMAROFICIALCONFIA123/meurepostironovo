# LAST BREATH — A Sans Encounter

Batalha de fã **2.5D** em **Godot 4**, com uma prévia independente para navegador. Um encontro inspirado na luta do Sans de UNDERTALE, não uma recriação do jogo completo.

## Jogar no Godot

1. Instale **Godot 4.3 ou posterior** (recomendado: 4.5.1, renderer Compatibility).
2. Importe `godot/project.godot` pelo gerenciador de projetos.
3. Pressione **F6** na cena principal ou **F5** para executar o projeto.

O projeto é autocontido: arte procedural em pixel art, cena, lógica e WAV original inclusos. Não precisa de plugins nem baixar assets. O primeiro import converte a música.

## Prévia web

```sh
python -m http.server 3000 --bind 0.0.0.0 --directory web
```

Abra `http://localhost:3000`. Esta versão usa **Canvas 2D + Web Audio**, não é um export Godot. Implementa as mesmas regras e oferece uma página própria, ajuda e troca de dificuldade. Não há dependências, fontes remotas ou rastreamento.

## Controles

| Tecla | Ação |
|---|---|
| Setas / WASD | Mover o coração / selecionar ação |
| ↑ / W / Espaço | Saltar quando a alma está azul |
| Shift | Movimento preciso |
| Z / Enter | Confirmar / acertar a barra de ataque |
| X | Voltar da barra de ataque |
| Esc | Pausar / continuar |
| M | Música on/off |
| F | Tela cheia |
| T (Godot) | Ativar/desativar treino sem dano |

Na web, use o seletor NORMAL/TREINO. Mouse/toque também seleciona ações; arrastar move a alma vermelha. **Teclado é recomendado**, especialmente para os saltos da alma azul.

## Fora da caixa: primeira pessoa e vitória alternativa

Durante uma onda, no menu ou na barra de ataque, aperte **E** (ou clique em **SAIR DA CAIXA** na prévia). A batalha é suspensa exatamente onde estava e a câmera entra no corredor em primeira pessoa.

- **WASD**: andar; **Shift**: correr.
- **Setas** ou **arrastar com botão esquerdo**: olhar.
- Aproxime-se do Sans a menos de 2 metros e olhe para ele.
- **Espaço** ou **clique na web** / **botão direito no Godot**: arremessar Sans.
- Sans voa e gira até o fim do corredor. No impacto, **explode em partículas**, com clarão e onda de choque, e abre uma **fenda para Deltarune**. Enter atravessa para o segundo encontro.
- **E** retorna à batalha antes do arremesso, preservando vida, itens, onda e obstáculos, com um segundo de invulnerabilidade.
- **Esc** pausa também a primeira pessoa e o arremesso. O ataque remoto é bloqueado: é necessário chegar perto e mirar no Sans.

A câmera usa a mesma projeção 2.5D, agora com posição, rotação, altura e recorte de geometria no plano próximo. Não precisa de ponteiro capturado.

## Crossover: DELTARUNE no UNDERTALE?!

Sim. É uma sequência alternativa de fã, não parte do cânone de nenhum dos jogos.

Após a explosão, **Enter ou clique** entra na introdução da luta com **Spamton NEO**. Confirme novamente para começar:

- **WASD / setas**: mover a alma amarela na nova arena.
- **Segure Z ou Espaço**: atirar para cima. Acerte o corpo do NEO para romper seus fios (180 de resistência).
- Três padrões alternados: leques direcionados, anúncios laterais e chuva de diamantes com abertura.
- Desviar perto dos projéteis acumula **TP**. Com 100%, o próximo tiro é fortalecido.
- Após 10 segundos, o menu permite **LUTAR** (25 de dano), **AGIR** (12 de dano e +25 TP), **ITEM** (40 HP, 3 usos), ou **POUPAR** (vence quando restam no máximo 35 pontos).
- Kris começa com 120 HP; projéteis causam 8 de dano com invulnerabilidade breve. O modo treino também vale aqui.
- Derrota permite tentar novamente o crossover, sem refazer o Sans. Vencer o NEO permite reiniciar desde o primeiro encontro.
- A prévia tem um novo motivo chiptune; no Godot, a trilha muda de andamento/tom.

O cenário, sprite de fã, projéteis e interface são procedurais e originais; esta é uma luta compacta inspirada em Deltarune, não uma reprodução completa da batalha oficial.

## O encontro

- 92 HP, dano de 5 com breve invulnerabilidade, 3 tortas que curam 38 HP.
- Ondas de 11 segundos com barreiras de ossos, saltos com gravidade, chuva de ossos e lasers telegrafados por 1 segundo.
- Ossos cianos só causam dano enquanto o jogador se move.
- LUTAR abre uma barra de tempo: acerte a região central para avançar. Sans desvia, mas fica progressivamente cansado. O encontro termina após **8 acertos no tempo correto**.
- AGIR e POUPAR avançam para outra onda sem aumentar o contador de acertos.
- ITEM cura e inicia a onda seguinte. A dificuldade aumenta conforme os turnos passam.
- Pausa, derrota, vitória, reinício, modo treino, partículas e música em loop.

É um encontro próprio, compacto: não inclui exploração, história completa ou reprodução exata de todas as fases do Sans original.

## Visual 2.5D

A edição 2.5D combina **geometria projetada em perspectiva** com sprites em pixel art e colisão 2D. O corredor tem piso quadriculado em profundidade, pilares extrudados com faces iluminadas, capitéis e bases, vitral, feixes de luz, sombras de contato e partículas. Na web há também reflexo estilizado no mármore, névoa, vinheta e paralaxe suave com o ponteiro. A arena ganha uma moldura chanfrada com volume, mas seu plano frontal permanece sem distorção: os ataques e suas colisões continuam legíveis.

É uma renderização híbrida 2.5D procedural, não movimentação livre em um mundo 3D. No Godot usa Node2D e projeção matemática; na prévia, Canvas. Não requer modelos ou texturas externos.

## Arte e música

A arte é desenhada com retângulos, sem suavização, com corredor, pilares, janelas, partículas e Sans animado. A música **Determination** é uma composição original sintetizada, não MEGALOVANIA. `tools/compose.py` recria o WAV sem dependências Python. A web sintetiza uma versão do mesmo motivo em tempo real.

UNDERTALE, DELTARUNE, Sans e Spamton pertencem a **Toby Fox**. Fan game não oficial, sem afiliação. Não são distribuídos sprites, áudio ou arquivos extraídos do jogo original.

## Validação

```sh
node --check web/game.js
node tools/test-game.cjs
python tools/compose.py  # opcional: recriar trilha
```

O teste da máquina de estados cobre 8 variantes de onda, persistência de obstáculos, salto, itens, pausa, timing, vitória e derrota/reinício. Também cobre impacto/explosão, portal, tiros, cura, derrota e vitória do crossover. GitHub Actions também importa e executa a cena no Godot 4.5.1 headless.

Neste ambiente local o executável Godot não está instalado e seu download foi bloqueado pela rede. O GDScript foi validado sintaticamente com `gdparse`; a validação de execução nativa fica a cargo do workflow Godot. A prévia está servida separadamente.
