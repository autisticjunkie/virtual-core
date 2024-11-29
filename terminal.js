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
            NETWORK: 'testnet', // or 'mainnet-beta' for mainnet
            RPC_ENDPOINT: 'https://api.testnet.solana.com',
            COMMITMENT: 'confirmed'
        };

        // Initialize Solana connection
        this.connection = null;
        this.wallet = null;

        this.currentState = 'intro';
        this.walletConnected = false;
        this.hasNFT = false;
        this.userInput = '';

        this.supportedWallets = {
            'phantom': window.solana,
            'solflare': window.solflare,
            'slope': window.slope,
            'sollet': window.sollet
        };

        this.initialize();
    }

    async initialize() {
        this.setupInputHandler();
        this.showIntro();
    }

    setupInputHandler() {
        this.term.onKey(({ key, domEvent }) => {
            const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

            if (domEvent.keyCode === 13) { // Enter key
                this.handleEnter();
            } else if (domEvent.keyCode === 8) { // Backspace
                if (this.userInput.length > 0) {
                    this.userInput = this.userInput.slice(0, -1);
                    this.term.write('\b \b');
                }
            } else if (printable) {
                this.userInput += key;
                this.term.write(key);
            }
        });
    }

    async typeText(text, delay = 30) {
        const lines = text.split('\n');
        for (const line of lines) {
            for (const char of line) {
                this.term.write(char);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            if (line !== lines[lines.length - 1]) {
                this.term.write('\r\n');
                await new Promise(resolve => setTimeout(resolve, delay * 2));
            }
        }
    }

    clearScreen() {
        this.term.write('\x1b[2J\x1b[H');
        this.term.write('\x1b[?25h'); // Show cursor
    }

    async showIntro() {
        await this.typeText('>> Welcome to the Virtual Core\r\n');
        await this.typeText('>> Initializing... ██████████ 100%\r\n\r\n');
        await this.typeText('"The Core has awakened. A nexus of energy, untapped potential, and infinite creativity lies before you. Will you harness its power or let it slip away?"\r\n\r\n');
        await this.typeText('>> Press ENTER to begin your journey.\r\n');
    }

    async showWelcome() {
        this.clearScreen();
        await this.typeText('>> Connection established.\r\n');
        await this.typeText('Synchronizing with your neural link...\r\n');
        await this.typeText('Scanning unique digital signature...\r\n');
        await this.typeText('Identity confirmed:\r\n');
        await this.typeText('Welcome, Seeker.\r\n\r\n');
        await this.typeText('The Core is alive, pulsing with the energy of countless decentralized nodes. Once fragmented, it now thrives as the heart of a new digital frontier.\r\n');
        await this.typeText('Your mission is clear: unlock its secrets, earn its rewards, and shape its future.\r\n\r\n');
        
        setTimeout(() => {
            this.clearScreen();
            this.showOptions();
        }, 5000);
    }

    async showOptions() {
        await this.typeText('>> Type one of the following commands:\r\n\r\n');
        await this.typeText('   - EXPLORE: Learn about the Core\'s origins.\r\n');
        await this.typeText('   - CONNECT: Link your wallet and establish your presence.\r\n');
        await this.typeText('   - SYNC: Generate your first Core Node.\r\n');
        await this.typeText('   - EXIT: Terminate this session.\r\n');
        this.currentState = 'options';
    }

    async explore() {
        this.clearScreen();
        await this.typeText('>> Exploring...\r\n');
        await this.typeText('>> Retrieving historical logs...\r\n\r\n');
        await this.typeText('"In the aftermath of Solana\'s expansion, the fragmented nodes of forgotten chains coalesced. A sentient network emerged, calling itself the Virtual Core. It offered a new way to connect, create, and collaborate—free from centralized control."\r\n\r\n');
        await this.typeText('>> The Core offers infinite opportunities. Your actions will define its shape and future.\r\n');
        await this.typeText('>> Type CONNECT to proceed, or EXIT to leave the Core.\r\n');
    }

    async initializeConnection() {
        try {
            // Initialize connection with testnet configuration
            this.connection = new solanaWeb3.Connection(
                this.config.RPC_ENDPOINT,
                this.config.COMMITMENT
            );

            await this.typeText(`>> Initializing Solana ${this.config.NETWORK} connection...\r\n`);
            
            // Test connection
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
        for (const [name, provider] of Object.entries(this.supportedWallets)) {
            if (provider) {
                return { name, provider };
            }
        }
        return null;
    }

    async checkCoreTokenBalance() {
        try {
            if (!this.wallet || !this.connection) {
                return 0;
            }

            // Get token account
            const tokenAccount = await this.connection.getParsedTokenAccountsByOwner(
                this.wallet.publicKey,
                { mint: new solanaWeb3.PublicKey(this.config.CORE_TOKEN_ADDRESS) }
            );

            if (tokenAccount.value.length === 0) {
                return 0;
            }

            // Get balance from the first token account
            const balance = tokenAccount.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            return balance;
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

            // Fetch all NFTs owned by the user from the specified collection
            const nfts = await metaplex.nfts().findAllByOwner({
                owner: this.wallet.publicKey,
            });

            // Check if any of the NFTs belong to our collection
            const hasCollectionNFT = nfts.some(nft => 
                nft.collection?.address.toString() === this.config.CORE_NFT_COLLECTION
            );

            return hasCollectionNFT;
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

        this.clearScreen();
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

            this.clearScreen();
            await this.typeText('>> Connection successful. Your digital signature has been embedded into the Core.\r\n');
            await this.typeText('>> Status: Active Seeker\r\n');
            await this.typeText('>> Access Level: Initiate\r\n');

            // Check both token balance and NFT ownership
            const [balance, hasNFT] = await Promise.all([
                this.checkCoreTokenBalance(),
                this.checkNFTOwnership()
            ]);

            await this.typeText(`>> Core Token Balance: ${balance}\r\n');
            
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
                collection: new solanaWeb3.PublicKey(this.config.CORE_NFT_COLLECTION),
            });

            await this.typeText(`>> NFT minted successfully!\r\n`);
            await this.typeText(`>> Mint Address: ${nft.address.toString()}\r\n`);
            
            return nft;
        } catch (error) {
            throw new Error(`Failed to mint NFT: ${error.message}`);
        }
    }

    async sync() {
        if (!this.walletConnected) {
            await this.typeText('>> Error: Please connect your wallet first using the CONNECT command.\r\n');
            return;
        }

        // Check NFT ownership first
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

        this.clearScreen();
        await this.typeText('>> Syncing...\r\n');
        await this.typeText('>> Analyzing your digital signature...\r\n');
        await this.typeText('>> Allocating resources... ██████████ 100%\r\n\r\n');

        try {
            await this.mintNFT();
            
            await this.typeText('>> Core Node Generated:\r\n');
            await this.typeText('>> Attributes:\r\n');
            await this.typeText('   - Stability: 85%\r\n');
            await this.typeText('   - Connectivity: 90%\r\n');
            await this.typeText('   - Growth Potential: 75%\r\n\r\n');
            
            this.hasNFT = true;
            await this.typeText('>> Congratulations, Seeker. Your Core Node is now live. As you engage with the Virtual Core, it will evolve, grow, and unlock new abilities.\r\n');
            await this.typeText('>> Type EXIT to conclude this session.\r\n');
        } catch (error) {
            await this.typeText(`>> Error minting NFT: ${error.message}\r\n`);
        }
    }

    async exit() {
        this.clearScreen();
        await this.typeText('>> Disconnecting from the Virtual Core...\r\n');
        await this.typeText('>> Synchronization complete.\r\n');
        await this.typeText('>> Remember, Seeker: The Core is always watching, waiting for your return.\r\n\r\n');
        await this.typeText('>> Session terminated.\r\n');
    }

    async handleEnter() {
        this.term.write('\r\n');
        const command = this.userInput.trim().toUpperCase();
        this.userInput = '';

        switch (this.currentState) {
            case 'intro':
                this.showWelcome();
                break;
            case 'options':
                switch (command) {
                    case 'EXPLORE':
                        await this.explore();
                        break;
                    case 'CONNECT':
                        await this.connect();
                        break;
                    case 'SYNC':
                        await this.sync();
                        break;
                    case 'EXIT':
                        await this.exit();
                        break;
                    default:
                        await this.typeText('>> Invalid command. Please try again.\r\n\r\n');
                        await this.showOptions();
                }
                break;
        }
    }
}

// Initialize the terminal when the page loads
window.addEventListener('load', () => {
    new VirtualCoreTerminal();
});
