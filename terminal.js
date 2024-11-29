class VirtualCoreTerminal {
    constructor() {
        this.term = null;
        this.fitAddon = null;
        this.currentLine = '';
        this.currentPosition = 0;
        this.prompt = '\x1b[32m>>\x1b[0m ';
        this.currentState = 'ready';
        this.walletConnected = false;
        this.hasNFT = false;
        this.wallet = null;
        
        this.config = {
            NETWORK: 'devnet',
            REQUIRED_TOKEN_BALANCE: 100
        };

        this.initialize();
    }

    async initialize() {
        try {
            await this.setupTerminal();
            await this.showIntroSequence();
        } catch (error) {
            console.error('Initialization error:', error);
            this.term.writeln('\x1b[31mError initializing terminal: ' + error.message + '\x1b[0m');
        }
    }

    async setupTerminal() {
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
    }

    async showIntroSequence() {
        // First screen
        this.term.clear();
        await this.typeText('\x1b[32m>> Welcome to the Virtual Core\x1b[0m');
        await this.typeText('\x1b[32m>> Initializing... ██████████ 100%\x1b[0m\n');
        await this.typeText('\x1b[33m"The Core has awakened. A nexus of energy, untapped potential, and infinite creativity lies before you. Will you harness its power or let it slip away?"\x1b[0m\n');
        await this.typeText('\x1b[32m>> Press ENTER to begin your journey.\x1b[0m');

        // Wait for ENTER
        await new Promise(resolve => {
            const handler = async (e) => {
                if (e.key === 'Enter') {
                    this.term.off('key', handler);
                    resolve();
                }
            };
            this.term.onKey(handler);
        });

        // Second screen
        await this.delay(500);
        this.term.clear();
        await this.typeText('\x1b[32m>> Connection established.\x1b[0m');
        await this.typeText('\x1b[32m>> Synchronizing with your neural link...\x1b[0m');
        await this.typeText('\x1b[32m>> Scanning unique digital signature...\x1b[0m');
        await this.typeText('\x1b[32m>> Identity confirmed:\x1b[0m');
        await this.typeText('\x1b[32m>> Welcome, Seeker.\x1b[0m');

        // Wait 5 seconds
        await this.delay(5000);

        // Third screen
        this.term.clear();
        await this.typeText('\x1b[33mThe Core is alive, pulsing with the energy of countless decentralized nodes. Once fragmented, it now thrives as the heart of a new digital frontier.\x1b[0m\n');
        await this.typeText('\x1b[33mYour mission is clear: unlock its secrets, earn its rewards, and shape its future.\x1b[0m\n');

        // Wait 5 seconds
        await this.delay(5000);

        // Show main menu
        this.term.clear();
        this.writeWelcomeMessage();
        this.writePrompt();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async typeText(text, speed = 30) {
        if (!text) return;
        
        const lines = text.split('\n');
        for (const line of lines) {
            if (line === '') {
                this.term.writeln('');
                continue;
            }
            
            for (const char of line) {
                this.term.write(char);
                await this.delay(speed);
            }
            this.term.writeln('');
            await this.delay(50); // Slight pause between lines
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

    handleInput(data) {
        // Handle backspace
        if (data === '\u007F') {
            if (this.currentPosition > 0) {
                this.currentLine = this.currentLine.slice(0, -1);
                this.currentPosition--;
                this.term.write('\b \b');
            }
            return;
        }

        // Handle enter
        if (data === '\r') {
            this.term.writeln('');
            this.processCommand(this.currentLine);
            this.currentLine = '';
            this.currentPosition = 0;
            return;
        }

        // Handle printable characters
        if (data >= String.fromCharCode(0x20) && data <= String.fromCharCode(0x7E)) {
            this.currentLine += data;
            this.currentPosition++;
            this.term.write(data);
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

    async exit() {
        this.currentState = 'exit';
        await this.typeText('\x1b[32m>> Disconnecting from the Virtual Core...\x1b[0m');
        await this.typeText('\x1b[32m>> Synchronization complete.\x1b[0m');
        await this.typeText('\x1b[32m>> Remember, Seeker: The Core is always watching, waiting for your return.\x1b[0m\n');
        await this.typeText('\x1b[32m>> Session terminated.\x1b[0m');
        window.removeEventListener('resize', this.fitAddon.fit);
    }

    // Placeholder methods for blockchain interactions
    async detectWallet() {
        // Detect available wallets (Phantom, Solflare, etc.)
        return { provider: window.solana, name: 'Phantom' };
    }

    async checkCoreTokenBalance() {
        // Check Core token balance
        return 0;
    }

    async checkNFTOwnership() {
        // Check if user owns Core NFT
        return false;
    }

    async mintNFT() {
        // Mint Core NFT
        return true;
    }
}

// Initialize the terminal when the page loads
window.addEventListener('load', () => {
    new VirtualCoreTerminal();
});
