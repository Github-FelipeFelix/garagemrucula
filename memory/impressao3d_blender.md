---
name: impressao3d_blender
description: "Como preparar modelos 3D pra impressão (Blender headless) nos jobs da Rebobina 3D — ambiente, MCP, 3MF, separar peças, validar manifold."
metadata: 
  node_type: memory
  type: reference
  originSessionId: bef3dfc0-a997-4371-a7d2-5863d3098f1e
---

# Impressão 3D / Blender — workflow dos jobs da Rebobina 3D

Contexto: jobs de impressão 3D pra clientes (ex.: [[projeto_vulcao]]). Modelos costumam vir da **Meshy AI** (gerador text/image→3D) e precisam ser ajustados antes de fatiar (Bambu Studio).

## Ambiente (Windows do Felipe)
- **Blender 5.1**: `C:\Program Files\Blender Foundation\Blender 5.1\blender.exe`.
- Python embutido do Blender: `C:\Program Files\Blender Foundation\Blender 5.1\5.1\python\bin\python.exe` — tem stdlib + **numpy**. Usar ele pra scripts standalone (parse/medição), pois o `python` do sistema é só o **stub da Microsoft Store** (não roda).
- **Trabalho por script headless**: `blender --background --factory-startup --python script.py -- <args>`. Preciso e reproduzível — foi assim que o vulcão foi feito e corrigido. **Scripts salvos (persistentes) em `C:\Users\FelipeFelix\Desktop\Vulcao2\_scripts\`** (o principal é **`build3.py`**; `build2.py` é obsoleto; o scratchpad da sessão some).
- **MCP do Blender: AGORA CONFIGURADO** (feito no fim da sessão 14/07/2026, a pedido do Felipe). Na máquina: `uv` 0.11.28 (`C:\Users\FelipeFelix\.local\bin\`), servidor **`blender-mcp` 1.6.4** (`...\.local\bin\blender-mcp.exe`), registrado como server **`blender`** (stdio) no `~/.claude.json` (escopo user). Add-on BlenderMCP já no Blender (`...Blender\5.1\scripts\addons\addon.py`).
  - **Pra usar (a cada sessão):** abrir Blender → habilitar add-on → viewport **N** → aba **BlenderMCP** → **Connect to Claude** (socket porta 9876) → conferir com `/mcp` (deve aparecer `blender ✓`).
  - **NÃO confundir o Felipe:** MCP ligado × headless = **geometria IDÊNTICA**. MCP só serve pra ele ME VER ao vivo e apontar ajustes na hora — **não melhora a malha**. O 1º resultado ruim foi abordagem minha, não falta de MCP.
  - Se der erro de conexão na próxima: provável mismatch de versão `addon.py` × server 1.6.4 → atualizar o addon do repo ahujasid/blender-mcp.

## Fatos que definem a abordagem
- **Export .3mf da Meshy = 1 mesh fundido, SEM cor/material/textura** (a cor se perde no export; não há PNG no zip). Logo, **não dá pra separar por cor/material — só geometricamente**.
- MAS a Meshy costuma modelar partes distintas como **componentes conexos separados (ilhas)** dentro do mesmo mesh. Ex.: vulcão vinha como vulcão + coroa de lava = 2 ilhas watertight. **Separar = split por ilha.**
- Blender 5.1 **não importa/exporta 3MF nativo**. Solução usada:
  - **Ler 3MF**: é um zip; parsear `3D/3dmodel.model` e `3D/Objects/*.model` com `xml.etree.iterparse` (tags `vertex`/`triangle`); a geometria pode estar num `.model` referenciado por `<component>`.
  - **Escrever 3MF colorido multi-objeto** (pro Bambu): zip com `[Content_Types].xml` + `_rels/.rels` + `3D/3dmodel.model` contendo `<m:colorgroup>` e um `<object pid=1 pindex=k>` por peça + `<build><item.../></build>`. Abre no Bambu como 2 objetos com cores.
  - **STL**: `bpy.ops.wm.stl_import(filepath=...)` / `bpy.ops.wm.stl_export(filepath=..., export_selected_objects=True)`.

## Técnicas que funcionaram (pure-python, sem depender de operador/contexto)
- **Componentes conexos**: union-find sobre as arestas dos triângulos (rápido em ~200k verts, sem entrar em edit mode).
- **Checar manifold/printabilidade**: contar arestas por nº de faces incidentes → `boundary`=1 face (buraco), `nonmanifold`=>2 faces. Watertight = ambos 0. (No Blender dá pra usar bmesh `e.is_manifold`/`e.is_boundary`.) Casca oca com aberturas (cratera+caverna) e fundo fechado dá **boundary=0** (as aberturas têm lábio/espessura).
- **Transformar vértices rápido**: numpy `mesh.vertices.foreach_get/set('co', arr)`.
- **Normais pra fora**: `bmesh.ops.recalc_face_normals`.
- **Renderizar SÓ pela forma (sem cor)**: engine `BLENDER_WORKBENCH` + `scene.display.shading` (`color_type='OBJECT'` p/ colorir por peça, `show_cavity=True cavity_type='BOTH'` revela relevo). Câmera ORTHO + constraint Track-To num Empty no centro. **Corte transversal** sem boolean: `camera.data.clip_start = distância-até-o-plano-central` (recorta a metade da frente).

## Aprendizados da 2ª rodada do vulcão (escavar + encaixar)
- **Modelo "oco" da Meshy costuma ser SÓLIDO** (só covinhas na superfície). Pra deixar oco de verdade: **boolean difference** com uma **cópia escalada do próprio objeto** como cortador (ex.: XY×0.82, remapear Z pra [chão, teto] via numpy) → paredes que seguem a forma + chão. Decimar o cortador (~0.15) deixa o boolean EXACT rápido (<1s).
- **Peças da Meshy geradas em prompts separados NÃO encaixam** (foram feitas pra flutuar). Pra "casar" a tampa (lava) no corpo: **escalar a tampa um pouco maior** (~1.25, pra transbordar a borda) + baixar + **boolean diff da tampa contra o corpo** → a base dela vira o negativo exato da superfície (escorridos assentam rentes, sem cravar nem flutuar). Achei o D certo por **contagem de triângulos**: se o diff não muda a contagem, não houve contato (tá flutuando).
- **Boolean (mesmo EXACT) deixa N-GONS.** STL do Blender triangula no export (ok), mas **gravador de 3MF na mão que só lê `poly.vertices[0:3]` FURA a malha**. Sempre **triangular** (`bmesh.ops.triangulate`) antes de gravar 3MF próprio. Conferir: nº de `<triangle>` do 3MF == nº de tris do STL.
- Objetos auxiliares (cortadores, cópias low-res) no cenário aparecem no render → `ob.hide_render=True` (booleans funcionam mesmo com o cortador oculto).

## 3ª rodada do vulcão (v3, AO VIVO via MCP) — gotchas que custaram caro
- **MCP ao vivo funcionou e foi decisivo.** Fluxo: `execute_blender_code` roda bpy/bmesh/numpy na janela do Felipe; `get_viewport_screenshot` p/ ver a viewport; e p/ CORTE/inspeção fina, renderizar WORKBENCH pra PNG num path local e **ler o PNG** (mais nítido que screenshot). Quebrou o ciclo de errar às cegas.
- **Encaixe da lava (o pedido central):** a lava Meshy é uma tampa que FLUTUA acima do vulcão. Receita que funcionou: escalar **só em XY** (~1.22; nunca em Z senão vira pescoço) → escorridos caem por fora; pôr o **topo no nível do cume** (sem pescoço); **preencher o centro afundado com uma CÚPULA suave** (cilindro reto vira "botão" feio com degrau); **unir (tampa ∪ cúpula) ANTES** de subtrair; então **subtrair o vulcão SÓLIDO** → a base da lava vira o **negativo exato** do vulcão = aninha/autolocaliza (encaixe). `keep_largest`+`weld` no fim (o recorte parte a lava em anel+disco central solto → fica só o maior).
- **Oco (o outro erro):** NÃO usar **Solidify** (auto-interseção na rocha densa → o boolean seguinte COLAPSA a malha pra ~25 tris). NÃO usar o vulcão-com-cratera como cortador (a cratera deixa **miolo/pilar central** e **parede dupla**). O que funcionou: **preencher a cratera do cortador ANTES** (union cilindro → "Vfilled"), aí reduzir **0.82 em XY** + subir `FLOOR` (deixa chão) + decimar, e subtrair do vulcão sólido → casca única, fundo fechado.
- **`keep_largest` pode APAGAR o chão** (quando o chão vira componente separado do boolean). O vulcão Meshy tem "saia" de pedras ligadas por **pescoços finos** → fatiar a base (`z≤k`) as **solta**.
- **`obj.ray_cast` foi NÃO-CONFIÁVEL** (retornou vazio com geometria presente, em certas alturas). Confiar em: contagem `bmesh` de `is_boundary`/`is_manifold` + **render de corte**. **`boundary=0` é a autoridade** p/ watertight — casca fechada tipo "vaso" (parede interna liga topo↔base) pode PARECER fundo aberto num render (você vê o interior pela caverna/cratera) mas estar fechada.

## 4ª rodada (v4) — lava COROA + fim do z-fighting (o que finalmente ficou igual à referência)
- **A ilha de lava do Meshy JÁ É a coroa da referência** (borda alta + poça recuada + escorridos orgânicos). O certo é **ASSENTAR ela**, não reconstruir o topo. Receita: escalar **só XY** (~1.15) até a borda bater na largura do topo do vulcão (**regra do Felipe: o fechamento/borda da lava NÃO pode passar da borda do "pescoço"** do vulcão — só os escorridos descem por fora); pôr a borda ~no cume (crista +1.2, transbordo como a foto); **subtrair o vulcão** → escorridos rente + poça enche a cratera; `keep_largest`+`weld` (o recorte solta 1 pingo marginal). Conecta porque a borda da coroa passa por cima da **abertura da cratera** (não recortada).
- **NÃO "preencher" a poça com cúpula/cilindro:** cúpula grande → **disco liso/chapado** ("tampa", com emenda na borda); cúpula pequena/cilindro → **sulco** (parece 2 peças) ou **botão** com degrau. A poça recuada da coroa crua é o visual certo — não mexer no topo.
- **"Furos" no slicer podem ser Z-FIGHTING, não furos:** se as duas peças (lava e rocha) têm faces **coincidentes** (a base da lava = superfície exata do vulcão, do recorte), o Bambu pisca como buraco + avisa "objetos sobrepostos". Checar: se STL/3MF têm `boundary=0`, NÃO são furos. **Fix: subtrair da lava um vulcão INFLADO** (escala ~1.004 sobre o centróide) → ~0,4mm de folga → some o z-fighting E dá folga pra cola (bom pro encaixe colado). Medir a folga com `obj.closest_point_on_mesh` numa amostra (mediana ~2mm, min >0,1 = ok).
- **Sempre comparar com a `referencia.jpeg` antes de finalizar** (pedido explícito do Felipe).
- Receita final reproduzível: `...\Vulcao2\_scripts\build3.py` (headless).

## 5ª rodada (v5) — "furos" = AUTO-INTERSEÇÃO (não boundary!) + gotas sem recorte
- **O maior aprendizado da sessão:** os "furos" que o slicer (Bambu) mostra podem ser **AUTO-INTERSEÇÕES** (faces do mesh que se cruzam), que **`bmesh` `is_boundary`/`is_manifold` NÃO detectam** (o mesh pode ter `boundary=0, nonmanifold=0` e mesmo assim ter faces cruzando). Passei 3 rodadas dizendo "tá limpo" olhando o boundary errado. **Detectar com `from mathutils.bvhtree import BVHTree`**: `tree=BVHTree.FromBMesh(bm); pairs=tree.overlap(tree)` e contar pares `(i,j)` cujas faces **não compartilham vértice** (não-adjacentes) = auto-interseções reais.
- **De onde vêm:** (a) a malha crua da Meshy já tinha algumas; (b) o **boolean do oco cria** algumas onde o cortador roça a superfície (perto da caverna). Constante em qualquer SXY → não é do tamanho da cavidade.
- **Limpar (leve): `clean_selfx`** — apaga as faces que se cruzam + 1-anel de vizinhas (`bmesh.ops.delete FACES`) e tapa (`holes_fill` + `triangle_fill`); repetir 2-4x até zerar. Mantém boundary=0. (Alternativa: **boolean UNION consigo mesma** com `use_self=True` resolve auto-interseção, MAS é PESADO — em 360k estoura o socket do MCP, embora complete; prefira o clean_selfx local.)
- **Gotas de lava: NÃO RECORTAR.** Recortar a lava contra o vulcão (subtrair) faz **corte reto** = gota "entrando na montanha" (o Felipe recusou) E **parte a lava** (centro separa). Como a lava imprime SEPARADA, deixe a **coroa crua inteira** (gotas 100% redondas), só escalada+posicionada+**achatada em Z** (gotas curtas como a foto). Sobra sobreposição lava↔rocha no montado = **aviso "objetos sobrepostos" (normal)**, não furo — imprime separado e cola.
- **Checar coincidência (z-fighting) entre 2 objetos:** `treeA.overlap(treeB)` e classificar por `faceA.normal.dot(faceB.normal)`: ~1 + centros próximos = **coplanar/coincidente (z-fighting → furo)**; senão = cruzamento limpo (ok). Sem recorte, quase tudo vira cruzamento (poucos coplanares).

## 6ª rodada — "furos" persistentes = FACES DEGENERADAS (área ~0) + a cadeia causal
- Depois de zerar self-x e boundary, o Bambu AINDA mostrava 2 furos. Diagnóstico do STL: **1696 faces DEGENERADAS** (`f.calc_area()<~1e-4`). boundary/nonmanifold/self-x = 0, mas faces de área zero = o slicer não fatia = **mancha escura/furo**. **Checar degeneradas também** (não só boundary/nonmanifold/self-x).
- **Cadeia causal completa (o "porquê"):** eu **decimava o cortador** do oco (0.3) → boolean roçava a superfície → criava **auto-interseções** → eu limpava com `clean_selfx` → o `holes_fill/triangle_fill` deixava um **CLUSTER de degeneradas** ali = os 2 furos visíveis. **Fix da RAIZ: NÃO decimar o cortador** → boolean limpo (self-x=0), dispensa `clean_selfx`, sem cluster. (Boolean não-decimado ~360k tris levou ~3-5s; vale a pena.)
- Sobram slivers **distribuídos** (dezenas+, variam com threshold/escala) — **invisíveis** (não clusterizam → sem furo visível), Bambu **auto-repara no fatiamento**. `dissolve_degenerate` reduz mas é instável (cria self-x/boundary transitórios) e triangular recria alguns → não caçar o zero absoluto.
- **STL perde precisão no round-trip** (funde vértices por tolerância → pode surgir boundary/nonmanifold que não existiam). O **3MF preserva** (vértices por índice). Julgar a malha pelo 3MF, não pelo STL reimportado.
- Carta na manga p/ malha 100% limpa: **voxel remesh** (garante manifold; mas ~1M tris e suaviza detalhe).

## 7ª rodada (v6) — furos RESOLVIDOS por PAREDE GROSSA + a lição sobre DETECTAR furo
- **A LIÇÃO MAIS IMPORTANTE: furo "see-through" NÃO é detectável por métrica.** `boundary`, `nonmanifold`, `self-x`, `degen`, e até o teste "apagar degeneradas e ver a boundary pular" acham sliver em TODA a linha de corte do boolean (13k+ faces, CENTENAS de "clusters" falsos) em QUALQUER escala/threshold — **não correspondem aos ~5 furos reais**. Perdi ~6 rodadas confiando em métrica. **Só detecta furo see-through:** (a) o **OLHO num render** — WORKBENCH, fundo ESCURO, `show_backface_culling=True`, e faces `area<0.02mm²` DELETADAS pra abrir o vão: buraco escuro grande = furo real; sliver inofensivo não abre see-through; (b) os **olhos do Felipe** — a marca de **CURSOR 3D** dele bateu a **3mm** do meu cluster = a única validação geométrica confiável.
- **Fix dos furos (IDEIA DO FELIPE, é a boa): PAREDE MAIS GROSSA.** `SXY_CAV 0.80→0.60`. Física: a caverna na frente tira massa da frente → o cortador (escalado sobre o CENTRO) roça a parede do lado OPOSTO (esq/fundo) → furos SÓ lá. Cavidade menor afasta o corte da superfície → parede sólida em toda volta. Verificado renderizando os 6 lados. **Detalhe da rocha PRESERVADO.** O **voxel remesh (carta na manga da 6ª rodada) foi DESCARTADO** — suaviza o detalhe e o Felipe não quis; parede grossa é melhor e mais simples.
- **NÃO funcionaram (registrar pra não repetir):** patch por bola (`Corpo_solid ∩ esferas` unido nos furos — a UNIÃO recria sliver + não dava pra localizar os furos certos, o detector achava 300+ falsos); thick-wall julgado pela métrica (dizia "ainda com furos" com boundary alto, mas o render mostrava LIMPO — a métrica MENTIA).
- **STL round-trip** (exportar+reimportar+soldar) funde os slivers inofensivos e revela os furos reais melhor que a malha pré-export — mas AINDA dá centenas de clusters falsos; **não substitui o olho**.
- **CRATERA vs LAVA (efeito colateral da parede grossa):** engrossar a parede fecha a BOCA da cratera pra dentro do furo interno da lava → a **borda de pedra aparece no vão da lava**. ⚠️ Corte de cratera CIRCULAR CENTRADO NO VULCÃO **não resolve**, porque **a lava da Meshy é orgânica e fica DESCENTRADA (~11mm) vs o eixo do vulcão**. **Fix: cortar a boca da cratera ALINHADA com a LAVA** — medir centro + borda interna do ANEL da lava do próprio mesh (`z>ltop-4`, min do raio por ângulo em 24 fatias = `innmax`) e cortar cilindro `raio=innmax+folga(3.5)` no centro do anel. Só no topo (paredes/furos intactos), escondido sob a lava. **LIÇÃO: encaixe de tampa orgânica → medir da TAMPA, não do eixo do corpo.** Conferir o encaixe por **seção** (corte fino ~4mm no plano central, `INTERSECT` com slab) + render de cima 360°.
- Receita final: `build3.py` com `SXY_CAV=0.60`, SEM voxel, `finish_mesh(V)+finish_mesh(L)`, e o bloco "CRATERA ALINHADA" no fim (escala final). 3 arquivos exportados juntos: `Vulcao_Corpo.stl`, `Vulcao_Lava.stl`, `Vulcao_Montado.3mf` (2 objetos/cores, 453.670 tris).

Aplicado em [[projeto_vulcao]]. **Operação da impressora (Bambu A1), fatiamento, recuperar layer shift e acabamento** ficam em [[impressao3d_bambu]].
