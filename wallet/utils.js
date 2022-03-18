import CoinSelection from "./coinSelection.js";

import Loader from "./loader";

import { Buffer } from "buffer";

function toHex(bytes) {
  return Buffer.from(bytes).toString("hex");
}

export async function bech32addr(api) {
  return Loader.Cardano.Address.from_bytes(
    Buffer.from(await api.getChangeAddress(), "hex")
  ).to_bech32();
}

export function addrToPubKeyHash(bech32Addr) {
  const pkh = Loader.Cardano.BaseAddress.from_address(
    Loader.Cardano.Address.from_bech32(bech32Addr)
  )
    .payment_cred()
    .to_keyhash();

  return toHex(pkh.to_bytes());
}

export async function getProtocolParameters(endpoint) {
  // Get's the current platform parameters
  const p = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "GET",
  }).then((response) => response.json());

  if (p.status >= 400 || p.status <= 600) {
    throw new Error("Bad response from server");
  }

  var value = {
    linearFee: Loader.Cardano.LinearFee.new(
      Loader.Cardano.BigNum.from_str(p.min_fee_a.toString()),
      Loader.Cardano.BigNum.from_str(p.min_fee_b.toString())
    ),
    minUtxo: Loader.Cardano.BigNum.from_str(p.min_utxo),
    poolDeposit: Loader.Cardano.BigNum.from_str(p.pool_deposit),
    keyDeposit: Loader.Cardano.BigNum.from_str(p.key_deposit),
    maxTxSize: p.max_tx_size,
    maxValSize: p.max_val_size,
  };

  return value;
}

export async function signTx(api, cbor) {
  // load tx cbor
  const txCli = Loader.Cardano.Transaction.from_bytes(Buffer.from(cbor, "hex"));

  // get tx body
  const txBody = txCli.body();

  // get tx witness-set
  const witnessSet = txCli.witness_set();

  // TODO: Add redeemer and datum to witness set

  // clear vkeys from witness-set
  witnessSet.vkeys()?.free();

  const decodedAddress = Loader.Cardano.Address.from_bytes(
    Buffer.from(await api.getChangeAddress(), "hex")
  );

  // create required signers
  const walletAddress = Loader.Cardano.BaseAddress.from_address(decodedAddress);

  const requiredSigners = Loader.Cardano.Ed25519KeyHashes.new();
  requiredSigners.add(walletAddress.payment_cred().to_keyhash());

  // set newly created required signer to our tx body
  txBody.set_required_signers(requiredSigners);

  // re-assemble transaction
  const tx = Loader.Cardano.Transaction.new(txBody, witnessSet);

  const witneses = await cardano.signTx(
    Buffer.from(tx.to_bytes(), "hex").toString("hex")
  );

  const signedTx = Loader.Cardano.Transaction.new(
    tx.body(),
    Loader.Cardano.TransactionWitnessSet.from_bytes(
      Buffer.from(witneses, "hex")
    )
  );

  const txhash = await api.submitTx(
    Buffer.from(signedTx.to_bytes(), "hex").toString("hex")
  );

  return txhash;
}

export async function sendWithWallet(cardano, addr, adaAmount, endpoint) {
  getProtocolParameters(endpoint)
    .then((r) => console.log(r))
    .catch((err) => console.error(err));

  // Get protocol parameters
  const protocolParameters = await getProtocolParameters(endpoint);

  // Convert the giving value to lovelace (an integer a million times greater than ADA)
  const lovelace = (parseFloat(adaAmount) * 1000000).toString();

  // Converts the wallet address into a BECH32 format
  const paymentAddr = await bech32addr(cardano);

  // Get's a list of UTxOs that belong to our user
  const rawUtxo = await cardano.getUtxos();

  // Go over each of these raw UTxOs and convert them to a better format
  const utxos = rawUtxo.map((u) =>
    Loader.Cardano.TransactionUnspentOutput.from_bytes(Buffer.from(u, "hex"))
  );

  // Create an empty outputs variable
  const outputs = Loader.Cardano.TransactionOutputs.new();

  // Add to this output a UTxO made by the receiver address and the value he will receive
  outputs.add(
    Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bech32(addr),
      Loader.Cardano.Value.new(Loader.Cardano.BigNum.from_str(lovelace))
    )
  );

  const MULTIASSET_SIZE = 5848;
  const VALUE_SIZE = 5860;
  const totalAssets = 0;

  CoinSelection.setProtocolParameters(
    protocolParameters.minUtxo.to_str(),
    protocolParameters.linearFee.coefficient().to_str(),
    protocolParameters.linearFee.constant().to_str(),
    protocolParameters.maxTxSize.toString()
  );

  CoinSelection.randomImprove(
    utxos,
    outputs,
    20 + totalAssets,
    protocolParameters.minUtxo.to_str()
  )
    .then(() => console.log("Cool"))
    .catch((err) => console.error(err));

  const selection = await CoinSelection.randomImprove(
    utxos,
    outputs,
    20 + totalAssets,
    protocolParameters.minUtxo.to_str()
  );

  const inputs = selection.input;
  const txBuilder = Loader.Cardano.TransactionBuilder.new(
    protocolParameters.linearFee,
    protocolParameters.minUtxo,
    protocolParameters.poolDeposit,
    protocolParameters.keyDeposit,
    protocolParameters.maxValSize,
    protocolParameters.maxTxSize
  );

  for (let i = 0; i < inputs.length; i++) {
    const utxo = inputs[i];
    txBuilder.add_input(
      utxo.output().address(),
      utxo.input(),
      utxo.output().amount()
    );
  }

  txBuilder.add_output(outputs.get(0));

  const change = selection.change;
  const changeMultiAssets = change.multiasset();

  // Check if change value is too big for single output
  if (changeMultiAssets && change.to_bytes().length * 2 > VALUE_SIZE) {
    const partialChange = Loader.Cardano.Value.new(
      Loader.Cardano.BigNum.from_str("0")
    );

    const partialMultiAssets = Loader.Cardano.MultiAsset.new();
    const policies = changeMultiAssets.keys();
    const makeSplit = () => {
      for (let j = 0; j < changeMultiAssets.len(); j++) {
        const policy = policies.get(j);
        const policyAssets = changeMultiAssets.get(policy);
        const assetNames = policyAssets.keys();
        const assets = Loader.Cardano.Assets.new();

        for (let k = 0; k < assetNames.len(); k++) {
          const policyAsset = assetNames.get(k);
          const quantity = policyAssets.get(policyAsset);

          assets.insert(policyAsset, quantity);

          // Check size
          const checkMultiAssets = Loader.Cardano.MultiAsset.from_bytes(
            partialMultiAssets.to_bytes()
          );

          checkMultiAssets.insert(policy, assets);
          if (checkMultiAssets.to_bytes().length * 2 >= MULTIASSET_SIZE) {
            partialMultiAssets.insert(policy, assets);
            return;
          }
        }

        partialMultiAssets.insert(policy, assets);
      }
    };

    makeSplit();

    partialChange.set_multiasset(partialMultiAssets);

    const minAda = Loader.Cardano.min_ada_required(
      partialChange,
      protocolParameters.minUtxo
    );

    partialChange.set_coin(minAda);

    txBuilder.add_output(
      Loader.Cardano.TransactionOutput.new(
        Loader.Cardano.Address.from_bech32(paymentAddr),
        partialChange
      )
    );
  }

  txBuilder.add_change_if_needed(
    Loader.Cardano.Address.from_bech32(paymentAddr)
  );

  const transaction = Loader.Cardano.Transaction.new(
    txBuilder.build(),
    Loader.Cardano.TransactionWitnessSet.new()
  );

  const size = transaction.to_bytes().length * 2;
  if (size > protocolParameters.maxTxSize)
    throw new Error("Transaction too big");

  const witneses = await cardano.signTx(
    Buffer.from(transaction.to_bytes(), "hex").toString("hex")
  );

  const signedTx = Loader.Cardano.Transaction.new(
    transaction.body(),
    Loader.Cardano.TransactionWitnessSet.from_bytes(
      Buffer.from(witneses, "hex")
    )
  );

  const txhash = await cardano.submitTx(
    Buffer.from(signedTx.to_bytes(), "hex").toString("hex")
  );

  return txhash;
}
