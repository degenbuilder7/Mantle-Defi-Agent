import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import Openai, { OpenAI } from 'openai'
import { FaDownload, FaCode, FaPlay, FaRocket } from 'react-icons/fa'
import { saveAs } from 'file-saver'
import { Buffer } from 'buffer'
import { toBase64 } from 'openai/core'
import axios from 'axios'
import { useActiveAccount } from 'thirdweb/react'

// Initialize OpenAI API
const openai = new Openai({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '', 
  dangerouslyAllowBrowser: true// Use an environment variable for your API key
});

export default function ContractGenerator() {
  const [contractType, setContractType] = useState("Smart Contract")
  const [promptText, setPromptText] = useState("")
  const [generatedContract, setGeneratedContract] = useState("")
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;

  const contractContent = `// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Owner {

    address private owner;
    
    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnerSet(address(0), owner);
    }

    function changeOwner(address newOwner) public isOwner {
        emit OwnerSet(owner, newOwner);
        owner = newOwner;
    }

    function getOwner() external view returns (address) {
        return owner;
    }
}`;

  const handleGenerateContract = async () => {
    setLoading(true)
    try {
      const prompt = `Generate a smart contract of type ${contractType} based on the following prompt: ${promptText}`

      // Make a request to OpenAI's API
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // You can use a different model like GPT-4 if available
        messages : [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500, // Adjust the token limit based on contract complexity
        temperature: 0.7, // Control the creativity level
      });

      setGeneratedContract(response.choices[0].message.content.trim());
    } catch (error) {
      console.error("Error generating contract:", error);
      setGeneratedContract(contractContent);
    }
    setLoading(false)
  }

  const downloadContract = () => {
    const blob = new Blob([generatedContract], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'generated_contract.sol')
  }

  const openInTronIDE = () => {
    // Encode the contract content
    const encodedContract = toBase64(generatedContract);

    const tronIDEUrl = `https://tronide.io/#code=${encodedContract}`;
    
    window.open(tronIDEUrl, '_blank');
  }

  const editContract = () => {
    setIsEditing(true);
  };

  const saveEditedContract = () => {
    setIsEditing(false);
  };

  const compileContract = async () => {
    try {
      const response = await axios.post('/api/compile-contract', {
        contractSource: generatedContract
      })
      console.log('Compilation successful:', response.data)

      deployContract(response.data.abi, response.data.bytecode, response.data.contractName)
    } catch (error) {
      console.error('Compilation failed:', error.response?.data || error.message)
    }
  }

  const deployContract = async ( abi : string, bytecode: string , name : string) => {
    
    try {
        const url = 'https://api.shasta.trongrid.io/wallet/deploycontract';

        const res = await axios.post(url, {
            abi,
            bytecode,
            owner_address: address || "TJmmqjb1DK9TTZbQXzRQ2AuA94z4gKAPFh",
            name,
            visible: true
        });


        const response = await res.data;
        console.log("Response: ", response);

        // sign and send the transaction

    } catch (error) {
        console.log("Error", error);

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
                  <Button onClick={openInTronIDE} className="bg-green-600 hover:bg-green-700">
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
                  <Button onClick={compileContract} className="bg-red-600 hover:bg-red-700">
                    <FaRocket className="mr-2" /> Deploy
                  </Button>
                </div>
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
