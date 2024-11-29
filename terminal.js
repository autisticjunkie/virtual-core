class VirtualCoreTerminal {
    constructor() {
        this.term = new Terminal({
            cursorBlink: true,
            cursorStyle: 'block',
            fontSize: 14,
            fontFamily: '"Courier New", monospace',
            theme: {
                background: '#000000',
                foreground: '#39ff14',
                cursor: '#39ff14',
                cursorAccent: '#000000',
                selection: 'rgba(57, 255, 20, 0.3)'
            },
            allowTransparency: true,
            rendererType: 'canvas',
            rows: Math.floor((window.innerHeight * 0.8) / 20),
            cols: Math.floor((window.innerWidth * 0.8) / 9),
            scrollback: 1000,
            convertEol: true
        });

        // Configuration object
        this.config = {
            CORE_TOKEN_ADDRESS: 'YOUR_TOKEN_ADDRESS_HERE',
            CORE_NFT_COLLECTION: 'YOUR_COLLECTION_ADDRESS_HERE',
            REQUIRED_TOKEN_BALANCE: 1,
            NETWORK: 'testnet',
            RPC_ENDPOINT: 'https://api.testnet.solana.com',
            COMMITMENT: 'confirmed'
        };

        // Initialize state
        this.connection = null;
        this.wallet = null;
        this.currentState = 'intro';
        this.walletConnected = false;
        this.hasNFT = false;
        this.userInput = '';

        // Initialize supported wallets
        this.supportedWallets = {
            'phantom': window.solana,
            'solflare': window.solflare,
            'slope': window.slope,
            'sollet': window.sollet
        };

        // Initialize terminal
        this.initialize();
    }

    initialize() {
        const container = document.getElementById('terminal-container');
        if (!container) return;

        // Open terminal in container
        this.term.open(container);
        
        // Initial resize
        this.handleResize();

        // Add event listeners
        window.addEventListener('resize', () => this.handleResize());
        this.term.onData(data => this.handleInput(data));

        // Start the terminal
        this.start();
    }

    handleResize() {
        const container = document.getElementById('terminal-container');
        if (!container) return;

        const cols = Math.floor((container.clientWidth - 40) / 9);
        const rows = Math.floor((container.clientHeight - 40) / 20);
        this.term.resize(cols, rows);
    }

    async start() {
        await this.clearScreen();
        await this.showWelcomeMessage();
    }

    async showWelcomeMessage() {
        await this.typeText('>> Virtual Core Terminal v1.0\r\n');
        await this.typeText('>> Initializing systems...\r\n');
        await this.typeText('>> Type CONNECT to link your digital signature.\r\n');
    }

    async typeText(text, delay = 30) {
        for (const char of text) {
            this.term.write(char);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    clearScreen() {
        this.term.clear();
        this.term.write('\x1b[H');
        return Promise.resolve();
    }

    handleInput(data) {
        // Handle special characters
        if (data === '\r') { // Enter key
            this.handleEnter();
        } else if (data === '\x7f') { // Backspace
            if (this.userInput.length > 0) {
                this.userInput = this.userInput.slice(0, -1);
                this.term.write('\b \b');
            }
        } else if (data.charCodeAt(0) > 31 && data.charCodeAt(0) < 127) { // Printable characters
            this.userInput += data;
            this.term.write(data);
        }
    }

    async handleEnter() {
        this.term.write('\r\n');
        const command = this.userInput.trim().toUpperCase();
        this.userInput = '';

        if (command) {
            await this.processCommand(command);
        }

        if (this.currentState !== 'exit') {
            this.term.write('>> ');
        }
    }

    async processCommand(command) {
        switch (command) {
            case 'CONNECT':
                await this.connect();
                break;
            case 'SYNC':
                await this.sync();
                break;
            case 'CLEAR':
                await this.clearScreen();
                break;
            case 'EXIT':
                await this.exit();
                break;
            default:
                await this.typeText('>> Unknown command. Available commands: CONNECT, SYNC, CLEAR, EXIT\r\n');
                break;
        }
    }

    async exit() {
        this.currentState = 'exit';
        await this.typeText('>> Terminating connection...\r\n');
        await this.typeText('>> Session ended.\r\n');
    }

    async initializeConnection() {
        try {
            this.connection = new solanaWeb3.Connection(
                this.config.RPC_ENDPOINT,
                this.config.COMMITMENT
            );

            await this.typeText(`>> Initializing Solana ${this.config.NETWORK} connection...\r\n`);
            
            const version = await this.connection.getVersion();
            await this.typeText(`>> Connected to Solana ${this.config.NETWORK}\r\n`);
            await this.typeText(`>> Version: ${version["solana-core"]}\r\n`);
            
            return true;
        } catch (error) {
            await this.typeText(`>> Error initializing connection: ${error.message}\r\n`);
            return false;
        }
    }

    async detectWallet() {
        for (const [name, wallet] of Object.entries(this.supportedWallets)) {
            if (wallet) {
                return { name, provider: wallet };
            }
        }
        return null;
    }

    async checkCoreTokenBalance() {
        try {
            if (!this.wallet || !this.connection) {
                return 0;
            }

            const tokenAccount = await this.connection.getParsedTokenAccountsByOwner(
                this.wallet.publicKey,
                { mint: new solanaWeb3.PublicKey(this.config.CORE_TOKEN_ADDRESS) }
            );

            if (tokenAccount.value.length === 0) {
                return 0;
            }

            return tokenAccount.value[0].account.data.parsed.info.tokenAmount.uiAmount;
        } catch (error) {
            console.error('Error checking token balance:', error);
            return 0;
        }
    }

    async checkNFTOwnership() {
        try {
            if (!this.wallet || !this.connection) {
                return false;
            }

            const metaplex = new Metaplex(this.connection)
                .use(walletAdapterIdentity(this.wallet));

            const nfts = await metaplex.nfts().findAllByOwner({
                owner: this.wallet.publicKey,
            });

            return nfts.some(nft => 
                nft.collection?.address.toString() === this.config.CORE_NFT_COLLECTION
            );
        } catch (error) {
            console.error('Error checking NFT ownership:', error);
            return false;
        }
    }

    async connect() {
        if (this.walletConnected) {
            await this.typeText('>> Error: Wallet already connected.\r\n');
            return;
        }

        await this.clearScreen();
        await this.typeText('>> Initiating connection...\r\n\r\n');
        await this.typeText('>> Searching for compatible wallet...\r\n');

        try {
            await this.initializeConnection();
            const detectedWallet = await this.detectWallet();

            if (!detectedWallet) {
                await this.typeText('>> Error: No compatible wallet found. Please install one of the following:\r\n');
                await this.typeText('   - Phantom Wallet\r\n');
                await this.typeText('   - Solflare\r\n');
                await this.typeText('   - Slope\r\n');
                await this.typeText('   - Sollet\r\n');
                return;
            }

            await this.typeText(`>> Found ${detectedWallet.name} wallet. Requesting connection...\r\n`);
            
            const response = await detectedWallet.provider.connect();
            this.wallet = detectedWallet.provider;
            this.walletConnected = true;

            await this.clearScreen();
            await this.typeText('>> Connection successful. Your digital signature has been embedded into the Core.\r\n');
            await this.typeText('>> Status: Active Seeker\r\n');
            await this.typeText('>> Access Level: Initiate\r\n');

            const [balance, hasNFT] = await Promise.all([
                this.checkCoreTokenBalance(),
                this.checkNFTOwnership()
            ]);

            await this.typeText(`>> Core Token Balance: ${balance}\r\n`);
            
            if (hasNFT) {
                this.hasNFT = true;
                await this.typeText('>> Core NFT Status: Active Node Detected\r\n');
                await this.typeText('   (You already have an active Core Node)\r\n');
            } else {
                await this.typeText('>> Core NFT Status: No Active Node\r\n');
                await this.typeText(balance < this.config.REQUIRED_TOKEN_BALANCE ? 
                    '   (Insufficient tokens to mint. Please acquire more Core tokens)\r\n' :
                    '   (Sufficient balance to mint your Core Node)\r\n');
            }

            await this.typeText('\r\n>> Type SYNC to generate your first Core Node.\r\n');
        } catch (error) {
            await this.typeText(`>> Error connecting wallet: ${error.message}\r\n`);
        }
    }

    async sync() {
        if (!this.walletConnected) {
            await this.typeText('>> Error: Please connect your wallet first using the CONNECT command.\r\n');
            return;
        }

        const hasNFT = await this.checkNFTOwnership();
        if (hasNFT) {
            await this.typeText('>> Error: You already have an active Core Node.\r\n');
            await this.typeText('>> Only one Core Node is allowed per wallet.\r\n');
            return;
        }

        const balance = await this.checkCoreTokenBalance();
        if (balance < this.config.REQUIRED_TOKEN_BALANCE) {
            await this.typeText('>> Error: Insufficient Core tokens. Please acquire more tokens before minting.\r\n');
            return;
        }

        await this.clearScreen();
        await this.typeText('>> Syncing...\r\n');
        await this.typeText('>> Analyzing your digital signature...\r\n');
        await this.typeText('>> Allocating resources... ██████████ 100%\r\n\r\n');

        try {
            const nft = await this.mintNFT();
            this.hasNFT = true;

            await this.typeText('>> Core Node Generated:\r\n');
            await this.typeText('>> Attributes:\r\n');
            await this.typeText('   - Stability: 85%\r\n');
            await this.typeText('   - Connectivity: 90%\r\n');
            await this.typeText('   - Growth Potential: 75%\r\n\r\n');
            
            await this.typeText('>> Congratulations, Seeker. Your Core Node is now live.\r\n');
            await this.typeText('>> As you engage with the Virtual Core, it will evolve and unlock new abilities.\r\n');
            await this.typeText('>> Type EXIT to conclude this session.\r\n');
        } catch (error) {
            await this.typeText(`>> Error: ${error.message}\r\n`);
        }
    }

    async mintNFT() {
        try {
            if (!this.wallet || !this.connection) {
                throw new Error('Wallet or connection not initialized');
            }

            await this.typeText('>> Preparing NFT minting on testnet...\r\n');

            const metaplex = new Metaplex(this.connection)
                .use(walletAdapterIdentity(this.wallet));

            await this.typeText('>> Creating your Core Node NFT...\r\n');

            const { nft } = await metaplex.nfts().create({
                uri: 'YOUR_METADATA_URI',
                name: 'Core Node',
                sellerFeeBasisPoints: 0,
                collection: new solanaWeb3.PublicKey(this.config.CORE_NFT_COLLECTION)
            });

            await this.typeText(`>> NFT minted successfully!\r\n`);
            await this.typeText(`>> Mint Address: ${nft.address.toString()}\r\n`);
            
            return nft;
        } catch (error) {
            throw new Error(`Failed to mint NFT: ${error.message}`);
        }
    }
}

// Initialize the terminal when the page loads
window.addEventListener('load', () => {
    new VirtualCoreTerminal();
});
