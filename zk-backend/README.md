# zk-backend

Este projeto fornece uma interface para geração de provas zk-SNARK usando o UltraPlonk. Você pode gerar provas e chaves de verificação usando dois métodos diferentes: via CLI ou via JavaScript.

## Gerando Provas via CLI

Siga os passos abaixo para gerar provas usando a interface de linha de comando:

1. Compile o circuito:

```bash
nargo compile
```

2. Execute o circuito para gerar o witness:

```bash
nargo execute
```

3. Gere a prova usando o backend:

```bash
bb prove -b ./target/circuit.json -w ./target/circuit.gz -o ./target/bin/proof.bin
```

4. Gere a chave de verificação:

```bash
bb write_vk -b ./target/circuit.json -o ./target/bin/vk.bin
```

5. Converta a prova para o formato hex:

```bash
noir-cli proof-data -n 1 --input-proof ./target/bin/proof.bin --output-proof ./target/hex/proof.hex --output-pubs ./target/hex/pub.hex
```

6. Converta a chave de verificação para o formato hex:

```bash
noir-cli key --input ./target/bin/vk.bin --output ./target/hex/vk.hex
```

## Gerando Provas via JavaScript

Alternativamente, você pode gerar provas usando a API JavaScript. Aqui está como fazer:

1. Compile o circuito (este passo ainda requer CLI):

```bash
nargo compile
```

2. Execute o circuito para gerar o witness:

```javascript
const { witness } = await noir.execute({
  birth_year: 1990,
  current_year: 2025,
});
```

3. Gere a prova e os inputs públicos:

```javascript
const { proof, publicInputs } = await backend.generateProof(witness);
```

4. Obtenha a chave de verificação:

```javascript
const vk = await backend.getVerificationKey();
```

## Estrutura de Diretórios

```
./target/
  ├── circuit.json     # Circuito compilado
  ├── circuit.gz       # Witness gerado
  └── bin/
      ├── proof.bin    # Prova binária
      └── vk.bin       # Chave de verificação binária
./target/hex/
  ├── proof.hex       # Prova em formato hex
  ├── pub.hex         # Inputs públicos em formato hex
  └── vk.hex          # Chave de verificação em formato hex
```
