class VirtualCoreTerminal {
    constructor() {
        try {
            // Initialize terminal
            this.term = new Terminal({
                cursorBlink: true,
                theme: {
                    background: '#000000',
                    foreground: '#39ff14',
                    cursor: '#39ff14'
                },
                fontFamily: 'Courier New, monospace',
                fontSize: 14,
                rendererType: 'canvas',
                convertEol: true
            });

            // Initialize state
            this.currentLine = '';
            this.commandHistory = [];
            this.historyIndex = -1;
            this.prompt = '\x1b[32m>\x1b[0m ';
            this.currentState = 'intro';
            this.walletConnected = false;
            this.hasNFT = false;
            
            // Configuration
            this.config = {
                CORE_TOKEN_ADDRESS: 'YOUR_TOKEN_ADDRESS_HERE',
                CORE_NFT_COLLECTION: 'YOUR_COLLECTION_ADDRESS_HERE',
                REQUIRED_TOKEN_BALANCE: 1,
                NETWORK: 'testnet',
                RPC_ENDPOINT: 'https://api.testnet.solana.com',
                COMMITMENT: 'confirmed'
            };

            // Initialize supported wallets
            this.supportedWallets = {
                'phantom': window?.solana,
                'solflare': window?.solflare,
                'slope': window?.slope,
                'sollet': window?.sollet
            };

            // Open terminal in container
            const container = document.getElementById('terminal-container');
            if (!container) throw new Error('Terminal container not found');
            
            this.term.open(container);

            // Initialize addons
            if (typeof window.FitAddon === 'undefined') {
                throw new Error('FitAddon not loaded');
            }
            this.fitAddon = new window.FitAddon.FitAddon();
            this.term.loadAddon(this.fitAddon);
            
            if (typeof window.WebLinksAddon === 'undefined') {
                throw new Error('WebLinksAddon not loaded');
            }
            this.term.loadAddon(new window.WebLinksAddon.WebLinksAddon());

            // Handle window resize
            window.addEventListener('resize', () => {
                if (this.fitAddon) {
                    this.fitAddon.fit();
                }
            });
            
            // Initial fit
            this.fitAddon.fit();

            // Setup input handling
            this.setupInputHandling();
            
            // Write welcome message
            this.writeWelcomeMessage();
            
            // Write initial prompt
            this.writePrompt();

        } catch (error) {
            console.error('Terminal initialization error:', error);
            const container = document.getElementById('terminal-container');
            if (container) {
                container.innerHTML = `<div style="color: #39ff14; padding: 20px; font-family: monospace;">
                    Error initializing terminal: ${error.message}<br>
                    Please check console for details.
                </div>`;
            }
        }
    }

    setupInputHandling() {
        this.term.onData(data => this.handleInput(data));
    }

    writeWelcomeMessage() {
        this.term.writeln('\x1b[32m>> Type one of the following commands:\x1b[0m');
        this.term.writeln('\x1b[32m   - EXPLORE: Learn about the Core\'s origins.\x1b[0m');
        this.term.writeln('\x1b[32m   - CONNECT: Link your wallet and establish your presence.\x1b[0m');
        this.term.writeln('\x1b[32m   - SYNC: Generate your first Core Node.\x1b[0m');
        this.term.writeln('\x1b[32m   - EXIT: Terminate this session.\x1b[0m');
        this.term.writeln('');
    }

    writePrompt() {
        this.term.write(this.prompt);
    }

    async typeText(text, delay = 30) {
        const lines = text.split('\n');
        for (const line of lines) {
            for (const char of line) {
                this.term.write(char);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            if (lines.length > 1) this.term.write('\r\n');
        }
    }

    handleInput(data) {
        switch (data) {
            case '\r': // Enter
                this.term.write('\r\n');
                this.processCommand(this.currentLine.trim());
                this.currentLine = '';
                break;
                
            case '\u007F': // Backspace
                if (this.currentLine.length > 0) {
                    this.currentLine = this.currentLine.slice(0, -1);
                    this.term.write('\b \b');
                }
                break;
                
            default:
                // Only handle printable characters
                if (data >= String.fromCharCode(32) && data <= String.fromCharCode(126)) {
                    this.currentLine += data;
                    this.term.write(data);
                }
                break;
        }
    }

    async processCommand(command) {
        command = command.toLowerCase().trim();
        
        switch (command) {
            case 'explore':
                await this.showExplore();
                break;
                
            case 'connect':
                await this.connectWallet();
                break;
                
            case 'sync':
                await this.syncNFT();
                break;
                
            case 'exit':
                await this.exit();
                break;
                
            case '':
                // Just show prompt for empty command
                break;
                
            default:
                await this.typeText('\x1b[31m>> Command not recognized in the neural interface.\x1b[0m');
                await this.typeText('\x1b[32m>> Available commands: EXPLORE, CONNECT, SYNC, EXIT\x1b[0m');
                break;
        }

        if (this.currentState !== 'exit') {
            this.writePrompt();
        }
    }

    async showExplore() {
        await this.typeText('\x1b[32m>> Exploring...\x1b[0m');
        await this.typeText('\x1b[32m>> Retrieving historical logs...\x1b[0m\n');

        await this.typeText('\x1b[33m"In the aftermath of Solana\'s expansion, the fragmented nodes of forgotten chains coalesced. A sentient network emerged, calling itself the Virtual Core. It offered a new way to connect, create, and collaborate—free from centralized control."\x1b[0m\n');

        await this.typeText('\x1b[32m>> The Core offers infinite opportunities. Your actions will define its shape and future.\x1b[0m');
        await this.typeText('\x1b[32m>> Type CONNECT to proceed, or EXIT to leave the Core.\x1b[0m');
    }

    async connectWallet() {
        if (this.walletConnected) {
            await this.typeText('\x1b[31m>> Error: Neural link already established.\x1b[0m');
            return;
        }

        this.term.clear();
        await this.typeText('\x1b[32m>> Initiating connection...\x1b[0m\n');
        await this.typeText('\x1b[32m>> Searching for compatible wallet...\x1b[0m');

        try {
            const detectedWallet = await this.detectWallet();

            if (!detectedWallet) {
                await this.typeText('\x1b[31m>> Error: No compatible neural interface detected.\x1b[0m');
                await this.typeText('\x1b[32m>> Please install Phantom, Solflare, Slope, or Sollet.\x1b[0m');
                return;
            }

            try {
                await detectedWallet.provider.connect();
                this.wallet = detectedWallet.provider;
                this.walletConnected = true;
            } catch (err) {
                await this.typeText(`\x1b[31m>> Neural link failed: ${err.message}\x1b[0m`);
                return;
            }

            await this.typeText('\x1b[32m>> Connection successful. Your digital signature has been embedded into the Core.\x1b[0m');
            await this.typeText('\x1b[32m>> Status: Active Seeker\x1b[0m');
            await this.typeText('\x1b[32m>> Access Level: Initiate\x1b[0m');

            const [balance, hasNFT] = await Promise.all([
                this.checkCoreTokenBalance(),
                this.checkNFTOwnership()
            ]);

            if (hasNFT) {
                this.hasNFT = true;
                await this.typeText('\x1b[32m>> Core Node Status: Active\x1b[0m');
            } else {
                await this.typeText('\x1b[32m>> Core NFTs Balance: 0 (Claim your first reward by syncing your node.)\x1b[0m');
                await this.typeText('\x1b[32m>> Type SYNC to generate your first Core Node.\x1b[0m');
            }

        } catch (error) {
            console.error('Neural link error:', error);
            await this.typeText(`\x1b[31m>> Neural interface error: ${error.message}\x1b[0m`);
        }
    }

    async syncNFT() {
        if (!this.walletConnected) {
            await this.typeText('\x1b[31m>> Error: Neural link required. Use CONNECT first.\x1b[0m');
            return;
        }

        if (this.hasNFT) {
            await this.typeText('\x1b[31m>> Error: Active Core Node already exists.\x1b[0m');
            return;
        }

        await this.typeText('\x1b[32m>> Syncing...\x1b[0m');
        await this.typeText('\x1b[32m>> Analyzing your digital signature...\x1b[0m');
        
        const balance = await this.checkCoreTokenBalance();
        
        if (balance < this.config.REQUIRED_TOKEN_BALANCE) {
            await this.typeText('\x1b[31m>> Error: Insufficient Core Energy for node generation.\x1b[0m');
            await this.typeText(`\x1b[32m>> Required: ${this.config.REQUIRED_TOKEN_BALANCE} CORE\x1b[0m`);
            await this.typeText(`\x1b[32m>> Current: ${balance} CORE\x1b[0m`);
            return;
        }

        await this.typeText('\x1b[32m>> Allocating resources... ██████████ 100%\x1b[0m\n');
        
        try {
            await this.mintNFT();
            this.hasNFT = true;
            
            await this.typeText('\x1b[32m>> Core Node Generated:\x1b[0m');
            await this.typeText('\x1b[32m>> Attributes:\x1b[0m');
            await this.typeText('\x1b[32m   - Stability: 85%\x1b[0m');
            await this.typeText('\x1b[32m   - Connectivity: 90%\x1b[0m');
            await this.typeText('\x1b[32m   - Growth Potential: 75%\x1b[0m\n');
            
            await this.typeText('\x1b[32m>> Congratulations, Seeker. Your Core Node is now live. As you engage with the Virtual Core, it will evolve, grow, and unlock new abilities.\x1b[0m');
            await this.typeText('\x1b[32m>> EXIT to conclude this session.\x1b[0m');
        } catch (error) {
            console.error('Core Node generation error:', error);
            await this.typeText(`\x1b[31m>> Generation failed: ${error.message}\x1b[0m`);
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

            const metaplex = new Metaplex(this.connection);
            const nfts = await metaplex
                .nfts()
                .findAllByOwner({ owner: this.wallet.publicKey });

            return nfts.some(nft => 
                nft.collection?.address.toString() === this.config.CORE_NFT_COLLECTION
            );
        } catch (error) {
            console.error('Error checking NFT ownership:', error);
            return false;
        }
    }

    async mintNFT() {
        if (!this.wallet || !this.connection) {
            throw new Error('Wallet or connection not initialized');
        }

        try {
            const metaplex = new Metaplex(this.connection);
            const { nft } = await metaplex
                .nfts()
                .create({
                    uri: 'YOUR_METADATA_URI',
                    name: 'Virtual Core Access',
                    sellerFeeBasisPoints: 0,
                    collection: new solanaWeb3.PublicKey(this.config.CORE_NFT_COLLECTION)
                });

            return nft;
        } catch (error) {
            throw new Error(`Failed to mint NFT: ${error.message}`);
        }
    }

    async exit() {
        this.currentState = 'exit';
        await this.typeText('\x1b[32m>> Disconnecting from the Virtual Core...\x1b[0m');
        await this.typeText('\x1b[32m>> Synchronization complete.\x1b[0m');
        await this.typeText('\x1b[32m>> Remember, Seeker: The Core is always watching, waiting for your return.\x1b[0m\n');
        await this.typeText('\x1b[32m>> Session terminated.\x1b[0m');
        window.removeEventListener('resize', this.fitAddon.fit);
    }
}

// Initialize the terminal when the page loads
window.addEventListener('load', () => {
    new VirtualCoreTerminal();
});
