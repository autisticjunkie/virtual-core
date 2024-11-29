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
    }

    async initialize() {
        this.term.open(document.getElementById('terminal-container'));
        this.fitAddon.fit();
        this.setupEventListeners();
        await this.showIntroSequence();
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

    async handleConnect() {
        this.term.clear();
        await this.typeText('>> Initiating connection...');
        await this.typeText('');
        await this.typeText('>> Searching for compatible wallet...');

        try {
            if (!window.solana || !window.solana.isPhantom) {
                await this.typeText('>> No compatible wallet found. Please install Phantom wallet.');
                return;
            }

            try {
                await window.solana.connect();
                this.walletConnected = true;
                await this.typeText('>> Connection successful. Your digital signature has been embedded into the Core.');
                await this.typeText('>> Status: Active Seeker');
                await this.typeText('>> Access Level: Initiate');
                await this.typeText('>> Core NFTs Balance: 0 (Claim your first reward by syncing your node.)');
                await this.typeText('');
                await this.typeText('>> Type SYNC to generate your first Core Node.');
            } catch (err) {
                await this.typeText('>> Connection failed. Please try again.');
            }
        } catch (error) {
            await this.typeText('>> Error connecting to wallet. Please try again.');
        }
    }

    async handleSync() {
        if (!this.walletConnected) {
            await this.typeText('>> Please connect your wallet first using the CONNECT command.');
            return;
        }

        this.term.clear();
        await this.typeText('>> Syncing...');
        await this.typeText('>> Analyzing your digital signature...');
        await this.typeText('>> Allocating resources... ██████████ 100%');
        await this.typeText('');

        // Here you would implement the actual token check and NFT minting
        const hasTokens = false; // Replace with actual token check
        
        if (!hasTokens) {
            await this.typeText('>> Error: No Core tokens detected in wallet.');
            await this.typeText('>> Core Node generation requires Core tokens.');
            return;
        }

        await this.typeText('>> Core Node Generated:');
        await this.typeText('>> Attributes:');
        await this.typeText('   - Stability: 85%');
        await this.typeText('   - Connectivity: 90%');
        await this.typeText('   - Growth Potential: 75%');
        await this.typeText('');
        await this.typeText('>> Congratulations, Seeker. Your Core Node is now live. As you engage with the Virtual Core, it will evolve, grow, and unlock new abilities.');
        await this.typeText('>> EXIT to conclude this session.');
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
}

// Initialize the terminal
const terminal = new VirtualCoreTerminal();
terminal.initialize();
