class VirtualCoreTerminal {
    constructor() {
        this.term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Courier New',
            theme: {
                background: '#000000',
                foreground: '#00ff00',
                cursor: '#00ff00'
            }
        });
        this.currentState = 'intro';
        this.fitAddon = new FitAddon.FitAddon();
        this.term.loadAddon(this.fitAddon);
        this.connection = null;
        this.userInput = '';
        this.walletConnected = false;
        this.walletAddress = null;
        this.hasMinted = false;
        
        // Configuration
        this.config = {
            REQUIRED_TOKEN_AMOUNT: 100,
            CORE_TOKEN_ADDRESS: 'YOUR_TOKEN_ADDRESS', // Replace with actual token address
            CORE_NFT_COLLECTION: 'YOUR_NFT_COLLECTION', // Replace with actual NFT collection address
            RPC_ENDPOINT: 'https://api.devnet.solana.com'
        };
    }

    async initialize() {
        this.term.open(document.getElementById('terminal-container'));
        this.fitAddon.fit();
        this.setupEventListeners();
        
        // Initialize Solana connection
        this.connection = new solanaWeb3.Connection(this.config.RPC_ENDPOINT);
        
        await this.showIntroSequence();
    }

    async detectWallet() {
        const wallets = {
            'Phantom': window.solana,
            'Solflare': window.solflare,
            'Slope': window.slope,
            'Sollet': window.sollet
        };

        for (const [name, wallet] of Object.entries(wallets)) {
            if (wallet) {
                return { name, provider: wallet };
            }
        }
        return null;
    }

    async checkTokenBalance(walletAddress) {
        try {
            const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
                new solanaWeb3.PublicKey(walletAddress),
                {
                    programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
                }
            );

            for (const account of tokenAccounts.value) {
                if (account.account.data.parsed.info.mint === this.config.CORE_TOKEN_ADDRESS) {
                    const balance = account.account.data.parsed.info.tokenAmount.uiAmount;
                    return balance >= this.config.REQUIRED_TOKEN_AMOUNT;
                }
            }
            return false;
        } catch (error) {
            console.error('Error checking token balance:', error);
            return false;
        }
    }

    async checkNFTOwnership(walletAddress) {
        try {
            const nfts = await this.connection.getParsedTokenAccountsByOwner(
                new solanaWeb3.PublicKey(walletAddress),
                {
                    programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
                }
            );

            for (const nft of nfts.value) {
                if (nft.account.data.parsed.info.mint === this.config.CORE_NFT_COLLECTION) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error checking NFT ownership:', error);
            return false;
        }
    }

    async handleConnect() {
        this.term.clear();
        await this.typeText('>> Initiating connection...');
        await this.typeText('');
        await this.typeText('>> Searching for compatible wallets...');

        try {
            const detectedWallet = await this.detectWallet();
            
            if (!detectedWallet) {
                await this.typeText('>> No compatible wallet found.');
                await this.typeText('>> Please install one of the following:');
                await this.typeText('   - Phantom Wallet');
                await this.typeText('   - Solflare Wallet');
                await this.typeText('   - Slope Wallet');
                await this.typeText('   - Sollet Wallet');
                return;
            }

            await this.typeText(`>> ${detectedWallet.name} wallet detected.`);
            
            try {
                await detectedWallet.provider.connect();
                this.walletConnected = true;
                this.walletAddress = detectedWallet.provider.publicKey.toString();
                
                await this.typeText('>> Connection successful. Your digital signature has been embedded into the Core.');
                await this.typeText('>> Status: Active Seeker');
                await this.typeText('>> Access Level: Initiate');
                
                // Check if user has already minted
                this.hasMinted = await this.checkNFTOwnership(this.walletAddress);
                
                if (this.hasMinted) {
                    await this.typeText('>> Core Node Status: ACTIVE');
                    await this.typeText('>> You have already generated your Core Node.');
                    await this.typeText('>> Type EXIT to conclude this session.');
                } else {
                    const hasTokens = await this.checkTokenBalance(this.walletAddress);
                    if (hasTokens) {
                        await this.typeText('>> Core Tokens Detected: SUFFICIENT');
                        await this.typeText('>> Type SYNC to generate your first Core Node.');
                    } else {
                        await this.typeText(`>> Core Tokens Required: ${this.config.REQUIRED_TOKEN_AMOUNT}`);
                        await this.typeText('>> Insufficient Core tokens detected.');
                        await this.typeText('>> Please acquire the required tokens before proceeding.');
                    }
                }
            } catch (err) {
                await this.typeText('>> Connection failed: ' + err.message);
            }
        } catch (error) {
            await this.typeText('>> Error establishing neural link: ' + error.message);
        }
    }

    async handleSync() {
        if (!this.walletConnected) {
            await this.typeText('>> Please connect your wallet first using the CONNECT command.');
            return;
        }

        if (this.hasMinted) {
            await this.typeText('>> Error: Core Node already exists for this neural signature.');
            await this.typeText('>> Only one Core Node is permitted per identity.');
            await this.typeText('>> Type EXIT to conclude this session.');
            return;
        }

        const hasTokens = await this.checkTokenBalance(this.walletAddress);
        if (!hasTokens) {
            await this.typeText('>> Error: Insufficient Core tokens detected.');
            await this.typeText(`>> Required: ${this.config.REQUIRED_TOKEN_AMOUNT} CORE`);
            return;
        }

        this.term.clear();
        await this.typeText('>> Syncing...');
        await this.typeText('>> Analyzing your digital signature...');
        await this.typeText('>> Allocating resources... ██████████ 100%');
        await this.typeText('');

        try {
            await this.mintNFT();
            this.hasMinted = true;
            
            await this.typeText('>> Core Node Generated:');
            await this.typeText('>> Attributes:');
            await this.typeText('   - Stability: 85%');
            await this.typeText('   - Connectivity: 90%');
            await this.typeText('   - Growth Potential: 75%');
            await this.typeText('');
            await this.typeText('>> Congratulations, Seeker. Your Core Node is now live.');
            await this.typeText('>> As you engage with the Virtual Core, it will evolve, grow, and unlock new abilities.');
            await this.typeText('>> Type EXIT to conclude this session.');
        } catch (error) {
            await this.typeText('>> Error during Core Node generation: ' + error.message);
            await this.typeText('>> Please try again or contact Core support.');
        }
    }

    async typeText(text, delay = 50) {
        for (const char of text) {
            this.term.write(char);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        this.term.write('\r\n');
    }

    async showIntroSequence() {
        this.term.clear();
        await this.typeText('>> Welcome to the Virtual Core');
        await this.typeText('>> Initializing... ██████████ 100%');
        await this.typeText('');
        await this.typeText('"The Core has awakened. A nexus of energy, untapped potential, and infinite creativity lies before you. Will you harness its power or let it slip away?"');
        await this.typeText('');
        await this.typeText('>> Press ENTER to begin your journey.');
    }

    async showSecondScreen() {
        this.term.clear();
        await this.typeText('>> Connection established.');
        await this.typeText('>> Synchronizing with your neural link...');
        await this.typeText('>> Scanning unique digital signature...');
        await this.typeText('>> Identity confirmed:');
        await this.typeText('>> Welcome, Seeker.');
        
        setTimeout(() => this.showThirdScreen(), 5000);
    }

    async showThirdScreen() {
        this.term.clear();
        await this.typeText('The Core is alive, pulsing with the energy of countless decentralized nodes. Once fragmented, it now thrives as the heart of a new digital frontier.');
        await this.typeText('Your mission is clear: unlock its secrets, earn its rewards, and shape its future.');
        
        setTimeout(() => this.showCommandMenu(), 5000);
    }

    async showCommandMenu() {
        this.term.clear();
        this.currentState = 'command';
        await this.typeText('>> Type one of the following commands:');
        await this.typeText('   - EXPLORE: Learn about the Core\'s origins.');
        await this.typeText('   - CONNECT: Link your wallet and establish your presence.');
        await this.typeText('   - SYNC: Generate your first Core Node.');
        await this.typeText('   - EXIT: Terminate this session.');
        this.term.write('\r\n>> ');
    }

    async handleCommand(command) {
        this.term.write('\r\n');
        switch (command.toUpperCase()) {
            case 'EXPLORE':
                await this.handleExplore();
                break;
            case 'CONNECT':
                await this.handleConnect();
                break;
            case 'SYNC':
                await this.handleSync();
                break;
            case 'EXIT':
                await this.handleExit();
                return; 
            default:
                await this.typeText('>> Unknown command. Please try again.');
        }
        this.term.write('>> ');
    }

    async handleExplore() {
        this.term.clear();
        await this.typeText('>> Exploring...');
        await this.typeText('>> Retrieving historical logs...');
        await this.typeText('');
        await this.typeText('"In the aftermath of Solana\'s expansion, the fragmented nodes of forgotten chains coalesced. A sentient network emerged, calling itself the Virtual Core. It offered a new way to connect, create, and collaborate—free from centralized control."');
        await this.typeText('');
        await this.typeText('>> The Core offers infinite opportunities. Your actions will define its shape and future.');
        await this.typeText('>> Type CONNECT to proceed, or EXIT to leave the Core.');
    }

    async handleExit() {
        this.term.clear();
        await this.typeText('>> Disconnecting from the Virtual Core...');
        await this.typeText('>> Synchronization complete.');
        await this.typeText('>> Remember, Seeker: The Core is always watching, waiting for your return.');
        await this.typeText('');
        await this.typeText('>> Session terminated.');
        if (this.connection) {
            this.connection.disconnect();
        }
    }

    async mintNFT() {
        // Implement actual NFT minting logic here using Metaplex
        throw new Error('NFT minting not yet implemented');
    }

    setupEventListeners() {
        this.term.onKey(({ key, domEvent }) => {
            if (this.currentState === 'intro' && domEvent.key === 'Enter') {
                this.showSecondScreen();
                return;
            }

            if (this.currentState === 'command') {
                if (domEvent.key === 'Enter') {
                    this.handleCommand(this.userInput.trim());
                    this.userInput = '';
                } else if (domEvent.key === 'Backspace') {
                    if (this.userInput.length > 0) {
                        this.userInput = this.userInput.slice(0, -1);
                        this.term.write('\b \b');
                    }
                } else if (key.length === 1) {
                    this.userInput += key;
                    this.term.write(key);
                }
            }
        });
    }
}

// Initialize the terminal
const terminal = new VirtualCoreTerminal();
terminal.initialize();
