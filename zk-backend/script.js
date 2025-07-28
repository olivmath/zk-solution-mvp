import { zkVerifySession, ZkVerifyEvents } from "zkverifyjs";
import ultraplonk from "olivmath_ultraplonk_zk_verify";
import { UltraPlonkBackend } from "@aztec/bb.js";
import { Noir } from "@noir-lang/noir_js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
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

  const vk = await backend.getVerificationKey();
  console.log("Verification key: ", vk);

  const convertedProof = "0x" + ultraplonk.convertProof(proof, 1);
  console.log("Converted proof: ", convertedProof);

  const convertedVk = "0x" + ultraplonk.convertVerificationKey(vk);
  console.log("Converted verification key: ", convertedVk);

  const SEED =
    "jacket worry seven predict jaguar next tissue pond panda bronze oil chair";
  const session = await zkVerifySession.start().Volta().withAccount(SEED);

  const { events: events1 } = await session
    .registerVerificationKey()
    .ultraplonk()
    .execute(convertedVk);

  let vkey = null;
  events1.on(ZkVerifyEvents.Finalized, (eventData) => {
    console.log("Verification finalized:", eventData);
    console.log(
      ">>>>>>>vkey.json",
      JSON.stringify({ hash: eventData.statementHash }, null, 2)
    );
    vkey = eventData.statementHash;
    return eventData.statementHash;
  });

  let statementproof = null;
  session.subscribe([
    {
      event: ZkVerifyEvents.NewAggregationReceipt,
      callback: async (eventData) => {
        console.log("New aggregation receipt:", eventData);

        let statementpath = await session.getAggregateStatementPath(
          eventData.blockHash,
          parseInt(eventData.data.domainId),
          parseInt(eventData.data.aggregationId),
          statement
        );
        console.log("Statement path:", statementpath);

        statementproof = {
          ...statementpath,
          domainId: parseInt(eventData.data.domainId),
          aggregationId: parseInt(eventData.data.aggregationId),
        };

        console.log(">>>>>aggregation.json", JSON.stringify(statementproof));
      },
      options: { domainId: 0 },
    },
  ]);

  const { events: events2 } = await session
    .verify()
    .ultraplonk()
    .withRegisteredVk()
    .execute({
      proofData: {
        proof: convertedProof,
        vk: vkey.hash,
        publicSignals: publicInputs,
      },
      domainId: 0,
    });

  let statement = null;
  events2.on(ZkVerifyEvents.IncludedInBlock, (eventData) => {
    console.log("Included in block", eventData);
    statement = eventData.statement;
  });
} catch (err) {
  console.error(`❌ Erro ao submeter prova: ${err.message}`);
  console.error(err);
}
