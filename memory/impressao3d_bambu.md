---
name: impressao3d_bambu
description: "Operação da impressora Bambu Lab A1 (bed-slinger): fatiamento, recuperar impressão que deu layer shift, achar altura de pausa num .3mf, e acabamento (esconder degrau). Aprendizados dos jobs da Rebobina 3D."
metadata: 
  node_type: memory
  type: reference
  originSessionId: cc67fddc-69e6-4882-bda4-967b87c723a1
---

# Bambu Lab A1 — operação, fatiamento, recuperação e acabamento

Complementa [[impressao3d_blender]] (aquele é a PREPARAÇÃO do modelo no Blender). Aqui é a IMPRESSÃO em si: máquina, slicer (Bambu Studio), recuperar impressão torta e acabamento. Contexto: jobs da Rebobina 3D (ex.: [[projeto_vulcao]]; job "baymax" 14/07/2026, de onde saíram estes aprendizados).

## A A1 é BED-SLINGER — peso na mesa é o calcanhar de Aquiles
- Na A1 a **MESA (placa) se move em Y** (frente/trás) a cada linha. O cabeçote move em X (esq/dir, na viga de cima); a viga sobe/desce em Z (nas colunas).
- **Motor Y** = o que puxa a mesa; fica na **traseira da base**, embaixo/atrás da mesa. É o que sofre com peso extra. (Jeito de achar: é o motor que aciona o vai-e-vem da mesa. Encostar: morno = OK; quente demais pra segurar a mão = abaixar a velocidade.) Numa **CoreXY (P1/X1)** a mesa só sobe em Z → peso incomoda MUITO menos.
- **Peso extra na mesa (ex.: chumbo dentro da peça) = inércia alta no Y.** Nos movimentos bruscos (cantos, retração rápida) a inércia passa do torque do motor Y → ele **perde passo** (patina) → **LAYER SHIFT** (camadas de cima saem deslocadas alguns mm em relação à base) + camada não assenta direito + **barulho de rango/estalo**. Sintoma clássico: barulho estranho, para, recolhe o hotend pro canto, tenta retomar (às vezes várias vezes).

## Fix do layer shift por excesso de peso: ir DEVAGAR
- **Reduzir velocidade E aceleração.** Inércia = massa × aceleração → menos aceleração = o motor dá conta do peso. No app Bambu, o **modo silencioso ≈ 50% (velocidade E aceleração), e é o PISO na A1** (não dá pra ir mais baixo). Dobra o tempo, mas para o skip e esfria o motor. Foi o que salvou a impressão do baymax.
- **Resfriamento (ventoinha) NÃO resfria o motor** — a ventoinha do slicer resfria o PLÁSTICO, não o stepper. O motor esfria **indo devagar** (o silencioso já faz isso). Em meia velocidade a peça ainda tem MAIS tempo de resfriar do que precisa → **não aumentar a ventoinha**; se acaso, **baixar 10-20%** ajuda a COLAGEM entre camadas (que enfraquece um pouco em velocidade baixa). Ou seja: no problema de peso, mexer em "cooling" é irrelevante — o lever é a velocidade.

## Recuperar impressão que DESLOCOU (layer shift) sem refazer tudo
1. **Hack ao vivo (arriscado, mas pode salvar):** pausar, **empurrar a mesa na mão** poucos mm pra **re-registrar a posição** — isso compensa os passos perdidos e re-alinha as camadas novas com a base boa. ⚠️ O resume pode **re-homear e desfazer** o ajuste → **vigiar as primeiras camadas** depois do play. E se der OUTRO tranco, o ajuste se perde → por isso **velocidade baixa é prioridade**. Garantir também que o peso está firme (não desliza e desequilibra).
2. **Plano seguro (salvar a base boa):** **cortar o modelo na altura da falha, reimprimir SÓ a parte de cima, colar** (ver abaixo). É o plano B se o hack não segurar.

## Achar a altura EXATA de uma pausa/camada num .3mf do Bambu
O `.3mf` é um **zip**. Abrir e ler:
- **`Metadata/custom_gcode_per_layer.xml`** → cada `<layer top_z="..." type="..." gcode="..."/>` dá a **altura Z EXATA** de uma ação custom. **Pausa manual = `gcode="M400 U1"`** → o `top_z` é a altura da pausa (onde o usuário adicionou material). Ex. real (baymax): `top_z="107.72"`.
- **`Metadata/project_settings.config`** (JSON) → `layer_height`, `initial_layer_print_height`. Converter camada↔altura: **`Z_topo(camada N) = initial_layer_print_height + (N-1)×layer_height`**.
- ⚠️ **O número da camada que o usuário LEMBRA costuma NÃO bater.** No baymax ele disse "camada 1005", mas o `top_z=107.72` com camada 0.16mm dá **camada ~673** (a 1005 seria ~160,84mm). **Confiar no `top_z` do arquivo + MEDIR a peça física com paquímetro** (a altura física manda).
- Se o `.3mf` **não tem `Metadata/plate_1.gcode`**, não foi salvo com o gcode fatiado — mas o `custom_gcode_per_layer.xml` já dá a altura da pausa, que é o que importa.
- Ler o zip via PowerShell: `System.IO.Compression.ZipFile.OpenRead` → achar a entry → `StreamReader`. Config é JSON (`ConvertFrom-Json`).

## Cortar + reimprimir + colar (a recuperação, plano B)
1. **Bambu Studio** → importar o mesmo modelo → ferramenta **Cortar (Cut)** na altura da falha (ou 1mm abaixo, no material limpo) → manter a parte **de CIMA**.
2. Imprimir a parte de cima **com a face do corte PRA BAIXO** (fica uma base plana boa pra colar; suporte se tiver saliência virada pra baixo). **Sem peso → velocidade normal.**
3. Na peça já impressa (a base boa): **lixar/cortar fora o topo torto** até ficar plano na altura do corte.
4. **Colar** — as 2 metades têm o **mesmo perfil no corte** → encaixam pelo contorno (é só casar). Peça pesada (chumbo dentro) → **epóxi** (aguenta mais que cola instantânea); peça grande → **pino/dowel** no meio pra alinhar e reforçar.

## Esconder degrau / layer shift (acabamento)
- O degrau tem **2 lados**: um **salta** (ressalto), o outro **afunda** (rebaixo). → **lixar/limar o que salta** + **preencher o que afunda**.
- **Massa (o que passar):** **massa plástica (poliéster automotiva, de funilaria) = a MELHOR** pra degraus de alguns mm (barata, seca rápido, **lixa muito bem**). **Massa epóxi (Durepoxi)** = moldável mas lixa pior. **Cola instantânea + pó** (bicarbonato ou pó de lixa) = só pra **frestas pequenas** (vira resina dura na hora).
- **Acabamento fino:** **primer/fundo alta espessura em spray** (cobre a textura das camadas + revela imperfeições) → lixar 220→400→600 entre demãos → **massa fina/rápida (glazing putty)** pro finíssimo.
- ⚠️ **Pra ficar INVISÍVEL, TEM que PINTAR por cima** — a massa é de outra cor e não some no PLA cru. Se a peça vai ser pintada (comum em peça de cliente), fica perfeito.
- **Aderência:** **lixar/riscar o PLA** onde vai passar a massa (PLA liso não segura bem).

## Best practice: adicionar PESO numa peça (pra não repetir o perrengue)
- **NÃO imprimir com peso na mesa da A1** (foi o que causou o layer shift no baymax). O jeito certo: modelar a peça com **CAVIDADE + TAMPA separada**, imprimir **normal** (rápido, sem peso), **adicionar o peso (chumbo etc.) DEPOIS de pronta** e **colar a tampa**. Zero risco de descalibrar + imprime na velocidade cheia. (Se for imprimir com peso mesmo assim, só numa CoreXY e/ou em velocidade bem baixa.)

Prep de modelo (Blender) em [[impressao3d_blender]]; jobs em [[projeto_vulcao]].
