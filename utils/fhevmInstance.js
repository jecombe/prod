// fhevmInstance.js
import { createFhevmInstance, getInstance, init } from "./fhevm";

// Initialisez FHEVM et créez une instance
async function initializeFHEVM() {
  await init();
  await createFhevmInstance();
}

// Exportez l'instance FHEVM
export async function getFhevmInstance() {
  await initializeFHEVM();
  return getInstance();
}
