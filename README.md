# Virtual Core Terminal

An immersive, cyberpunk-styled web terminal with Solana wallet integration and interactive NFT minting capabilities.

## Features

- Interactive cyberpunk-themed terminal interface
- Solana wallet integration (supports Phantom, Solflare, Slope, Sollet)
- Core token balance checking
- NFT minting functionality
- Responsive design
- Animated text and visual effects

## Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/virtual-core.git
cd virtual-core
```

2. Install dependencies:
```bash
npm install
```

3. Configure your Solana network settings in `terminal.js`:
```javascript
NETWORK: 'testnet', // or 'mainnet-beta'
RPC_ENDPOINT: 'https://api.testnet.solana.com'
```

4. Replace placeholder addresses:
- Set your Core token address
- Set your NFT collection address

5. Start the development server:
```bash
npm start
```

## Usage

1. Connect your Solana wallet
2. Check your Core token balance
3. Mint your unique Core Node NFT
4. Interact with the terminal using available commands

## Commands

- `CONNECT` - Connect your Solana wallet
- `SYNC` - Mint your Core Node NFT
- `CLEAR` - Clear the terminal screen
- `EXIT` - Exit the terminal session

## Development

Built with:
- HTML5
- CSS3
- JavaScript
- Solana Web3.js
- Metaplex
- xterm.js

## License

MIT License
