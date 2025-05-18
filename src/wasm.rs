// Copyright 2024, The Horizen Foundation
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

use crate::VerificationKey;
use hex::encode as hex_encode;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = convertProof)]
pub fn convert_proof(proof_data: &[u8], num_inputs: usize) -> Result<JsValue, JsValue> {
    const WORD_SIZE: usize = 32;

    let total_pub_inputs_len = num_inputs * WORD_SIZE;
    if proof_data.len() < total_pub_inputs_len {
        return Err(JsValue::from_str(
            "Prova muito curta para a quantidade de inputs públicos",
        ));
    }

    // Remove os public inputs (início do vetor)
    let (_pub_inputs_bytes, proof_without_pubs) = proof_data.split_at(total_pub_inputs_len);

    // Codifica a prova como string hexadecimal
    let proof_hex = hex_encode(proof_without_pubs);

    Ok(JsValue::from_str(&proof_hex))
}

#[wasm_bindgen(js_name = convertVerificationKey)]
pub fn convert_verification_key(vk_data: &[u8]) -> Result<JsValue, JsValue> {
    let solidity_bytes = VerificationKey::<()>::try_from(vk_data)
        .map_err(|e| JsValue::from_str(&format!("Erro ao interpretar VK: {}", e)))?
        .as_solidity_bytes();

    let hex_string = hex_encode(&solidity_bytes);

    Ok(JsValue::from_str(&hex_string))
}
