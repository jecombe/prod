import { BrowserProvider, ethers } from "ethers";
import { initFhevm, createInstance, FhevmInstance } from "fhevmjs";

export const init = async () => {
  await initFhevm();
  console.log("OK INIT");
};

let instance;

export const createFhevmInstance = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const network = await provider.getNetwork();
  const chainId = +network.chainId.toString();

  const ret = await provider.call({
    // fhe lib address, may need to be changed depending on network
    to: "0x000000000000000000000000000000000000005d",
    // first four bytes of keccak256('fhePubKey(bytes1)') + 1 byte for library
    data: "0xd9d47bb001",
  });

  const abiCoder = new ethers.utils.AbiCoder();

  const decode = abiCoder.decode(["bytes"], ret);
  //const decoded = ethers.AbiCoder.defaultAbiCoder().decode(["bytes"], ret);

  const publicKey = decode[0];

  instance = await createInstance({ chainId, publicKey });
};

export const getTokenSignature = async (contractAddress, userAddress) => {
  if (getInstance().hasKeypair(contractAddress)) {
    return getInstance().getTokenSignature(contractAddress);
  } else {
    const { publicKey, token } = getInstance().generateToken({
      verifyingContract: contractAddress,
    });
    const params = [userAddress, JSON.stringify(token)];
    const signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params,
    });
    getInstance().setSignature(contractAddress, signature);
    return { signature, publicKey };
  }
};

export const getInstance = () => {
  return instance;
};
