import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { FaDownload, FaCode, FaPlay, FaRocket } from 'react-icons/fa'
import { saveAs } from 'file-saver'
import { toBase64 } from 'openai/core'
import axios from 'axios'
import { useActiveAccount } from 'thirdweb/react'
import { ethers } from 'ethers'

// Add type definitions
interface BrianResponse {
  contract: string;
  contractName: string;
  version: string;
  abi: any;
  bytecode: string;
  standardJsonInput: string;
  result: any
}

export default function ContractGenerator() {
  const [contractType, setContractType] = useState("Smart Contract")
  const [promptText, setPromptText] = useState("")
  const [generatedContract, setGeneratedContract] = useState("")
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [compiledData, setCompiledData] = useState<{abi?: string, bytecode?: string}>({})
  const [deploymentLoading, setDeploymentLoading] = useState(false)
  const [deploymentError, setDeploymentError] = useState<string | null>(null)
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null)

  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;

  const provider = new ethers.JsonRpcProvider("https://rpc.testnet.mantle.xyz");
  const wallet = new ethers.Wallet(`${process.env.NEXT_PUBLIC_KEY}`, provider);


  
  const handleGenerateContract = async () => {
    setLoading(true)
    try {
      const prompt = `Generate a smart contract of type ${contractType} based on the following prompt: ${promptText}`

      const response = await axios.post<BrianResponse>(
        'https://api.brianknows.org/api/v0/agent/smart-contract',
        {
          prompt,
          compile: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Brian-Api-Key': process.env.NEXT_PUBLIC_BRIAN_API_KEY
          }
        }
      );

      // Extract code from markdown code block
      const codeMatch = response.data.result.contract.match(/```solidity\n([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        setGeneratedContract(codeMatch[1].trim());
      }

      // Store ABI and bytecode
      setCompiledData({
        abi: response.data.abi,
        bytecode: response.data.bytecode
      });

    } catch (error) {
      console.error("Error generating contract:", error);
      setGeneratedContract("// Error generating contract");
    }
    setLoading(false)
  }

  const downloadContract = () => {
    const blob = new Blob([generatedContract], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'generated_contract.sol')
  }

  const openInRemixIDE = () => {
    // Encode the contract content
    const encodedContract = toBase64(generatedContract);

    const tronIDEUrl = `https://remix.ethereum.org/#code=${encodedContract}`;
    
    window.open(tronIDEUrl, '_blank');
  }

  const editContract = () => {
    setIsEditing(true);
  };

  const saveEditedContract = () => {
    setIsEditing(false);
  };

  const deployContract = async () => {
    if (!compiledData.abi || !compiledData.bytecode) {
      setDeploymentError('No compiled data available');
      return;
    }
    
    setDeploymentLoading(true);
    setDeploymentError(null);
    
    try {
      const factory = new ethers.ContractFactory(
        compiledData.abi, 
        compiledData.bytecode, 
        wallet
      );

      const contract = await factory.deploy();
      const deployedContract = await contract.deploymentTransaction()?.wait();
      
      if (!deployedContract?.contractAddress) {
        throw new Error('Failed to get deployed contract address');
      }

      setDeployedAddress(deployedContract.contractAddress);
      console.log("Contract deployed at:", deployedContract.contractAddress);
    } catch (error) {
      console.error("Error deploying contract:", error);
      setDeploymentError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setDeploymentLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Unleashing the Power of Web3</h1>
        <p className="text-gray-400">
          We provide Mastering the Art of generating and deploying<br />
          Smart contract using simple prompts with AI.
        </p>
      </header>

      <main className="flex-grow flex space-x-8">
        <div className="w-1/2 space-y-4">
          <div>
            <label htmlFor="contract-type" className="block text-sm font-medium mb-2">
              Choose Contract Type
            </label>
            <Select value={contractType} onValueChange={setContractType}>
              <SelectTrigger id="contract-type" className="w-full bg-gray-800">
                <SelectValue placeholder="Select contract type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800">
                <SelectItem value="Smart Contract">Smart Contract</SelectItem>
                <SelectItem value="NFT Contract">NFT Contract</SelectItem>
                <SelectItem value="Token Contract">Token Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="prompt-text" className="block text-sm font-medium mb-2">
              Enter the Prompt Text
            </label>
            <Textarea
              id="prompt-text"
              placeholder="Generate a Solidity smart contract named 'Owner' that allows setting and changing the owner of the contract"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full h-40 bg-gray-800 border-purple-500"
            />
          </div>

          <Button
            onClick={handleGenerateContract}
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Contract"}
          </Button>
        </div>

        <div className="w-1/2 space-y-4">
          <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center">
            {generatedContract ? (
              <>
                {isEditing ? (
                  <Textarea
                    value={generatedContract}
                    onChange={(e) => setGeneratedContract(e.target.value)}
                    className="w-full h-96 mb-4 bg-gray-700 text-white"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap mb-4 max-h-96 overflow-y-auto">{generatedContract}</pre>
                )}
                <div className="flex space-x-4">
                  <Button onClick={downloadContract} className="bg-blue-600 hover:bg-blue-700">
                    <FaDownload className="mr-2" /> Download
                  </Button>
                  <Button onClick={openInRemixIDE} className="bg-green-600 hover:bg-green-700">
                    <FaCode className="mr-2" /> Open in Mantle IDE
                  </Button>
                  {isEditing ? (
                    <Button onClick={saveEditedContract} className="bg-yellow-600 hover:bg-yellow-700">
                      <FaPlay className="mr-2" /> Save Changes
                    </Button>
                  ) : (
                    <Button onClick={editContract} className="bg-yellow-600 hover:bg-yellow-700">
                      <FaPlay className="mr-2" /> Edit Contract
                    </Button>
                  )}
                  <Button 
                    onClick={deployContract} 
                    className="bg-red-600 hover:bg-red-700"
                    disabled={!compiledData.abi || !compiledData.bytecode || deploymentLoading}
                  >
                    <FaRocket className="mr-2" />
                    {deploymentLoading ? "Deploying..." : "Deploy"}
                  </Button>
                </div>
                {deploymentError && (
                  <p className="text-red-500 mt-2">{deploymentError}</p>
                )}
                {deployedAddress && (
                  <p className="text-green-500 mt-2">
                    Contract deployed at: {deployedAddress}
                  </p>
                )}
              </>
            ) : (
              <p className="text-2xl font-bold">Lets build something cool 😎</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
