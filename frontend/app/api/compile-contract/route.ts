import { NextResponse } from 'next/server'
import solc from 'solc'

export async function POST(request: Request) {
  try {
    const { contractSource } = await request.json()

    const input = {
      language: 'Solidity',
      sources: {
        'contract.sol': {
          content: contractSource
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*']
          }
        }
      }
    }

    const output = JSON.parse(solc.compile(JSON.stringify(input)))

    if (output.errors) {
      const errors = output.errors.filter((error: any) => error.severity === 'error')
      if (errors.length > 0) {
        return NextResponse.json({ error: 'Compilation failed', details: errors }, { status: 400 })
      }
    }

    // Extract bytecode and ABI
    const compiledContract = output.contracts['contract.sol']
    const contractName = Object.keys(compiledContract)[0]
    const bytecode = compiledContract[contractName].evm.bytecode.object
    const abi = compiledContract[contractName].abi

    return NextResponse.json({ bytecode, abi , contractName})
  } catch (error) {
    console.error('Compilation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}