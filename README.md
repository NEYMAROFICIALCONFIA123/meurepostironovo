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

UNDERTALE e Sans pertencem a **Toby Fox**. Fan game não oficial, sem afiliação. Não são distribuídos sprites, áudio ou arquivos extraídos do jogo original.

## Validação

```sh
node --check web/game.js
node tools/test-game.cjs
python tools/compose.py  # opcional: recriar trilha
```

O teste da máquina de estados cobre 8 variantes de onda, persistência de obstáculos, salto, itens, pausa, timing, vitória e derrota/reinício. GitHub Actions também importa e executa a cena no Godot 4.5.1 headless.

Neste ambiente local o executável Godot não está instalado e seu download foi bloqueado pela rede. O GDScript foi validado sintaticamente com `gdparse`; a validação de execução nativa fica a cargo do workflow Godot. A prévia está servida separadamente.
