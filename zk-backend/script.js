import ultraplonk from "ultraplonk_no_std";
import { UltraPlonkBackend } from "@aztec/bb.js";
import { Noir } from "@noir-lang/noir_js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED = process.env.SEED;

const circuitPath = path.join(__dirname, "./demo/target/circuit.json");
const circuit = JSON.parse(fs.readFileSync(circuitPath, "utf-8"));
const backend = new UltraPlonkBackend(circuit.bytecode);
const noir = new Noir(circuit);

const { witness } = await noir.execute({
  birth_year: 1990,
  current_year: 2025,
});

console.log("Witness: ", witness);

console.log("Generating proof...");
const { proof, publicInputs } = await backend.generateProof(witness);
console.log("Proof generated!");

const convertedProof = ultraplonk.convertProof(proof, 1);
console.log("Converted proof: ", convertedProof);

const vk = await backend.getVerificationKey();
console.log("Verification key: ", vk);

const convertedVk = ultraplonk.convertVerificationKey(vk)
console.log("Converted verification key: ", convertedVk);

