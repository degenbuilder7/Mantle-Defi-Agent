# Mantle Defi Agent

### Functionality and Fundamental Goal of the Project:

The project serves as a comprehensive platform that integrates AI-driven smart contract generation with decentralized finance (DeFi) functionality, designed specifically for the Mantle blockchain. 

It offers users a wide array of tools including:

1. AI-Powered Smart Contract Generation: Users can input natural language prompts to generate various types of smart contracts (e.g., NFT contracts, Token contracts) in Solidity, which can then be edited, compiled, and deployed on Mantle.
   
2. DeFi Transaction Execution: The platform allows users to perform various decentralized finance actions such as token transfers, swaps, staking, and lending, all within the Mantle ecosystem. It supports protocols like Justlend, Sunswap, HTX DAO, and more.

3. User-Friendly Interface: With a modular sidebar, users can access additional tools like token exploration, data search, and contract discovery in a streamlined manner.

---

### What Problem is Your App Trying to Solve?

The project addresses several key pain points in the Mantle blockchain and decentralized finance space:

1. Complexity in Smart Contract Development: For many developers, creating and deploying smart contracts can be difficult and time-consuming. This platform leverages AI to simplify contract generation, making it accessible to both experienced developers and newcomers to the Mantle ecosystem.

2. Fragmented DeFi Access: Engaging with DeFi platforms on Mantle often requires navigating multiple platforms and interfaces. This app consolidates these activities, allowing users to easily manage token swaps, staking, and lending from a single platform.

3. Increased Barrier to Entry for New Developers: For developers new to blockchain, the learning curve can be steep. By providing AI-assisted contract creation and streamlined access to DeFi actions, the app reduces the technical barriers and encourages more people to participate in building on Mantle.

In essence, the platform aims to simplify and enhance the developer experience on Mantle while also providing a powerful toolset for DeFi interactions.


We do not need to deploy any smart contracts for the core functionality of this project because we focus on DeFi intents.

By using our interface, users can perform various DeFi actions like lending, staking, swapping, and transferring assets through the respective protocols' already-deployed contracts.

### Additional Smart Contract Features:
Beyond DeFi interactions, our platform also supports smart contract generation, editing, and deployment. Users can:
1. AI-Powered Contract Generation: The platform enables users to generate smart contracts (NFT, Token, or General) using simple prompts powered by OpenAI.
2. Contract Compilation & Deployment: After the contract is generated, users can compile and deploy the smart contract directly from the app, simplifying the process of getting their contracts onto the blockchain.
3. Editing & MantleIDE Integration: Users can also edit the AI-generated contract, open it in MantleIDE, and make further changes before compiling and deploying it. This gives users complete flexibility to tweak their contracts as needed before final deployment.

### Example Contracts:
Here are some contracts generated, compiled, and deployed using our Dapp:
- Owner Contract: An AI-generated ownership management contract that allows setting and updating the owner address, compiled and deployed using our app.

- Token Swap Contract: A contract to swap tokens within the Mantle blockchain, which was generated, edited, and deployed via the app.

This dual functionality of DeFi interaction and smart contract creation makes the platform a comprehensive tool for both developers and users within the Mantle ecosystem.


### 1. DeFi Protocol Integration:
### 1. DeFi Protocol Integration:
We integrated our platform with major DeFi protocols on the Mantle blockchain, such as:
- **Merchant Moe**: Users can perform operations such as:
  - **Swap**: Users can swap different tokens on mantle.
  - **Add Liquidity**: Users can add liquidity to the MOE-MNT pair.
  - **Remove Liquidity**: Users can remove liquidity from the MOE-MNT pair.
- **Pendle**: Users can engage in yield tokenization and liquidity provision.
- **Karak**: Users can participate in various DeFi activities, including staking and trading.
- **Agni Finance**: Users can swap MNT for USDT and add liquidity to the MNT-USDT pair.
- **Treehouse**: Users can access unique DeFi services tailored for the Mantle ecosystem.
- **Ondo Finance**: Users can manage their assets and participate in structured finance products.
- **Puff Penthouse**: Users can explore exclusive DeFi opportunities and community-driven projects.


### 2. Wallet Integration:
- We integrated MantleLink, a widely used wallet for the Mantle network, to manage users' accounts, sign transactions, and enable interaction with Mantle-based tokens (TRX, TRC-20 tokens like USDD, and more).
- This integration allows users to easily connect their MantleLink wallet, perform DeFi actions, and deploy smart contracts directly from our platform.

### 3. Smart Contract Compilation and Deployment:
While DeFi actions do not require new contract deployments, our platform also supports AI-powered smart contract generation where users can:
- Generate contracts using natural language prompts (e.g., NFT contracts, token contracts, ownership contracts).
- Compile and deploy contracts directly from the app, using MantleIDE for testing and deployment.
- Edit contracts within the app and open them in MantleIDE for further changes, providing users with a smooth development experience on the Mantle blockchain.

### Links to APIs, Tools, and Protocols:
