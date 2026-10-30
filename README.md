# LAST BREATH — A Sans Encounter

Batalha de fã **2D/2.5D com dimensões em 3D real** em **Godot 4**, com uma prévia independente para navegador. Um encontro inspirado na luta do Sans de UNDERTALE, não uma recriação do jogo completo.

## Jogar no Godot

1. Instale **Godot 4.5.1 ou posterior** (recomendado: 4.5.1, renderer Compatibility).
2. Importe `godot/project.godot` pelo gerenciador de projetos.
3. Pressione **F6** na cena principal ou **F5** para executar o projeto.

O projeto é autocontido: arte procedural em pixel art/3D, cenas, lógica e WAV original inclusos. Não precisa de plugins nem baixar assets. O primeiro import converte a música.

## Prévia web

```sh
python -m http.server 3000 --bind 0.0.0.0 --directory web
```

Abra `http://localhost:3000`. Esta versão usa **Canvas 2D + Web Audio + WebGL 2 (Three.js)**, não é um export Godot. Implementa as mesmas regras e oferece uma página própria, ajuda e troca de dificuldade. A biblioteca 3D já está incluída no projeto: não precisa de npm para jogar e não faz downloads de CDNs. Não há fontes remotas ou rastreamento. WebGL 2/aceleração gráfica é necessário para as dimensões 3D; sem ele há um aviso, e a batalha 2D continua disponível.

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
- Sans voa e gira até o fim do corredor. No impacto, **explode em partículas**, com clarão e onda de choque, e lança o jogador automaticamente numa **viagem pelo multiverso** antes do segundo encontro.
- **E** retorna à batalha antes do arremesso, preservando vida, itens, onda e obstáculos, com um segundo de invulnerabilidade.
- **Esc** pausa também a primeira pessoa e o arremesso. O ataque remoto é bloqueado: é necessário chegar perto e mirar no Sans.

A câmera usa a mesma projeção 2.5D, agora com posição, rotação, altura e recorte de geometria no plano próximo. Não precisa de ponteiro capturado.

## Crossover: DELTARUNE no UNDERTALE?!

Sim. É uma sequência alternativa de fã, não parte do cânone de nenhum dos jogos.

Ao lançar o Sans, você ouve **ISSO NÃO ESTÁ NO ROTEIRO!**. Depois do impacto e da explosão, começa automaticamente uma sequência de seis ambientes originais em 3D estilizado, pela câmera do jogador:

1. **Homem-Aranha:** telhado, avenida, prédios com janelas iluminadas, passarelas e herói em volume balançando na teia.
2. **God of War:** montanhas, neve e guerreiro com machado.
3. **Minecraft:** terreno de blocos instanciados, texturas pixeladas na web, árvores, lago, nuvens e criatura verde.
4. **Roblox:** avatar volumétrico, plataformas flutuantes, nuvens e arco de checkpoint.
5. **Garagem do Rick e Morty:** sala com paredes, bancada, armários, frascos e monitores; Rick dispara uma grade 3D na direção da câmera, mas ela erra e a captura falha.
6. **Spamton NEO:** seus fios bloqueiam o portal, interrompem os saltos e iniciam automaticamente a luta.

A viagem dura aproximadamente 106 segundos de animação. A câmera é em **primeira pessoa**, com mãos visíveis, eixo vertical corrigido e sem rotação/avanço automáticos. **WASD** anda em relação à direção da câmera; **Shift** corre. Há limites maiores de exploração por cenário (não são fases completas com colisão/física); **setas ou arrastar com o botão esquerdo** olham ao redor. O botão **DIMENSÕES 3D** na página permite testar diretamente, sem refazer o Sans. **Enter ou clique sem arrastar** avança a cena atual na web (Enter ou botão direito no Godot) (após uma proteção de 0,65 s contra cliques acidentais); **Esc** pausa. A derrota no NEO reinicia só o segundo encontro, sem obrigar a rever a viagem. Durante a luta, tentar usar E exibe o bloqueio do teletransporte.

São **ambientes de homenagem com exploração limitada durante a sequência**, não cópias completas ou versões jogáveis dos jogos citados. Personagens e marcas pertencem aos respectivos titulares; os desenhos procedurais são originais.

Na luta com **Spamton NEO**:

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

## Dimensões 3D reais

- **Web:** Three.js/WebGL 2, `PerspectiveCamera`, malhas de caixas/cilindros/toros, personagens compostos por volumes, materiais PBR, iluminação hemisférica/direcional, sombras suaves, névoa, portais emissivos e antialiasing. O resultado é composto no Canvas junto do HUD; não é uma imagem ou vídeo pré-renderizado.
- **Godot:** `SubViewport` com mundo 3D próprio, `Camera3D`, `Node3D`, `MeshInstance3D`, `MultiMeshInstance3D`, `WorldEnvironment`, luzes e sombras. Só o HUD e os controles ficam em 2D; as falas são reproduzidas por AudioStreamPlayer.
- As seis dimensões foram convertidas. A luta do Sans, a saída inicial do corredor e a batalha de Spamton preservam suas mecânicas anteriores 2D/2.5D; não são jogos completos das franquias citadas.

### Edição visual ampliada e dublada

- Modelos de homenagem redesenhados com rostos, olhos, nariz, dedos, cápsulas anatômicas, roupas sobrepostas, bolsos, acessórios, barba, cabelo e machado. Minecraft e Roblox preservam sua linguagem de blocos.
- Cenários maiores com quarteirões, carros, estruturas de telhado, vegetação, pedras, terreno expandido, plataformas distantes, armários, tubulações, bancada e equipamentos.
- Na web: materiais rugosos com textura/bump procedural, montanhas de malha irregular, sombras 2048² e bloom moderado com composição HDR. No Godot: modelos arredondados, cenários ampliados e materiais com normais procedurais; o renderer Compatibility não replica todo o pós-processamento da web.
- A câmera não gira, inclina ou avança sozinha. Mouse para cima olha para cima; mouse para baixo olha para baixo. WASD acompanha o rumo da câmera.
- É uma melhoria procedural independente e estilizada, **não uma produção AAA fotorealista** com modelos escaneados, captura de movimento ou níveis de jogos comerciais.

### Mundos gerados por seed — atualização procedural

Os seis ambientes agora são construídos por geradores, não por listas fixas de prédios e plataformas. Cada nova jornada sorteia uma seed, mostrada no HUD; terreno, distribuição de construções, vegetação, mobiliário e variantes de objetos mudam. Os personagens e acontecimentos da história continuam em pontos de referência para preservar a sequência narrativa.

- Exterior: 96 × 96 metros, 2.304 células de piso; garagem: 24 × 36 metros, 216 células. São mapas **finitos**, não mundos infinitos por streaming.
- Piso completo em toda a malha, inclusive no Roblox; floresta com relevo e Minecraft com blocos contíguos. A altura da câmera acompanha a mesma superfície renderizada.
- Corredor protegido da entrada ao portal, limites de exploração e colisão horizontal com deslizamento/subpassos para evitar atravessar construções, árvores e pedras. Os espaços livres do caminho são intencionais.
- Centenas de elementos nos ambientes externos, com desenho instanciado (`InstancedMesh` na web / `MultiMesh` no Godot), em vez de uma chamada de renderização por objeto.
- Na web: roupas com torso perfilado, Roblox arredondado com rosto/roupa/calçados e NEO com asas curvas chanfradas, articulações e dedos. A edição Godot mantém seus personagens estilizados e recebe o novo gerador e modelos ambientais.

Fontes: `web/world-layout.mjs`, `web/procedural-dimensions.js`, `web/model-details.js`, `godot/world_layout.gd` e `godot/procedural_dimension.gd`. A seed reproduz o mapa dentro de cada implementação; o resultado não é idêntico entre Godot e navegador.

```sh
npm run test:procedural
```

O teste cobre 384 mapas (64 seeds × 6 dimensões), 751.104 células, repetibilidade, variação entre seeds, densidade, caminho até o portal, colisões e limites. O teste WebGL continua verificando as seis cenas, a câmera e a sequência até NEO. O código nativo passou por análise sintática, mas não foi executado localmente no Godot.

### Falas em português, sem legendas de diálogo

Nove arquivos Ogg locais em `web/audio/` e `godot/assets/voices/`: aviso do roteiro, narração dos quatro primeiros mundos, Rick, falha da captura, Spamton e bloqueio da fuga. São performances **sintéticas e originais**, escolhidas para o projeto; não são as vozes oficiais nem gravações extraídas das franquias.

- O áudio começa após clicar em jogar ou em Dimensões 3D; não depende de serviço de voz online.
- Cada salto interrompe a fala anterior. Rick reage à falha da captura aos 11,3 s da cena.
- Esc pausa e retoma a fala no ponto certo. M controla voz e música. A música baixa durante a fala.
- Os diálogos narrativos/balões foram retirados da tela; nomes de mundos, menus, controles e avisos de estado continuam como interface.
- O navegador decodifica os arquivos pelo Web Audio; a versão Godot usa AudioStreamPlayer.

### Recriar o bundle 3D da web

```sh
npm ci
npm run build:3d
```

O arquivo incluído é `web/vendor/dimensions3d.js`. A fonte editável é `web/dimensions3d.src.js`. Three.js é MIT; sua licença está em `web/vendor/licenses/THREE-LICENSE.txt`.

Teste opcional no navegador (com a prévia servida):

```sh
npx playwright install chromium
node tools/test-dimensions3d.cjs
```

O teste verifica as seis cenas WebGL, eixos verticais da câmera, movimento, giro, arrastar sem pular, transição final para NEO, carregamento das nove vozes, pausa/retomada, mudo e reinício.

## Corredor 2.5D anterior

A edição 2.5D combina **geometria projetada em perspectiva** com sprites em pixel art e colisão 2D. O corredor tem piso quadriculado em profundidade, pilares extrudados com faces iluminadas, capitéis e bases, vitral, feixes de luz, sombras de contato e partículas. Na web há também reflexo estilizado no mármore, névoa, vinheta e paralaxe suave com o ponteiro. A arena ganha uma moldura chanfrada com volume, mas seu plano frontal permanece sem distorção: os ataques e suas colisões continuam legíveis.

É uma renderização híbrida 2.5D procedural, não movimentação livre em um mundo 3D. No Godot usa Node2D e projeção matemática; na prévia, Canvas. Não requer modelos ou texturas externos.

## Arte e música

A arte das batalhas 2D é desenhada com retângulos, sem suavização, com corredor, pilares, janelas, partículas e Sans animado. A música **Determination** é uma composição original sintetizada, não MEGALOVANIA. `tools/compose.py` recria o WAV sem dependências Python. A web sintetiza uma versão do mesmo motivo em tempo real.

UNDERTALE, DELTARUNE, Sans e Spamton pertencem a **Toby Fox**. Fan game não oficial, sem afiliação. Não são distribuídos sprites, áudio ou arquivos extraídos do jogo original.

## Validação

```sh
node --check web/game.js
node tools/test-game.cjs
python tools/compose.py  # opcional: recriar trilha
```

O teste da máquina de estados cobre 8 variantes de onda, persistência de obstáculos, salto, itens, pausa, timing, vitória e derrota/reinício. Também cobre impacto/explosão, portal, tiros, cura, derrota e vitória do crossover. GitHub Actions também importa e executa a cena no Godot 4.5.1 headless.

Neste ambiente local o executável Godot não está instalado e seu download foi bloqueado pela rede. O GDScript foi validado sintaticamente com `gdparse`; a validação de execução nativa fica a cargo do workflow Godot. A prévia está servida separadamente.
