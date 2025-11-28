# Private Key Format Help

## Issue: Private Key Starts with "034"

If your private key starts with `034`, you're likely looking at one of these:

1. **Compressed Public Key** (starts with `02` or `03`) - ❌ Not a private key
2. **WIF (Wallet Import Format)** - Needs conversion
3. **Different wallet format** - Needs conversion

## Ethereum Private Key Format

Ethereum private keys should be:
- **Hex format**: `0x` followed by 64 hexadecimal characters
- **Total length**: 66 characters (0x + 64 chars)
- **Example**: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

## How to Get Your Correct Private Key

### From MetaMask

1. Open MetaMask extension
2. Click the three dots (⋮) next to your account name
3. Select **"Account details"**
4. Click **"Show private key"**
5. Enter your MetaMask password
6. Copy the private key (it should start with `0x`)

### From Other Wallets

**If you see a key starting with `034`:**
- This might be a **compressed public key** or **WIF format**
- You need to find the actual **private key** in your wallet settings
- Look for "Export Private Key" or "Show Private Key" option

## Converting Formats (If Needed)

### If You Have a WIF Key

WIF keys start with `5` or `K`/`L` (Bitcoin format). You can convert using:

```javascript
// Using ethers.js (if you have Node.js)
const ethers = require("ethers");
// WIF conversion would require additional libraries
```

**Better approach**: Export the private key directly from your wallet in hex format.

### If You Have a Mnemonic Phrase

If you have a 12/24-word seed phrase, you can derive the private key:

```javascript
const ethers = require("ethers");
const mnemonic = "your twelve word seed phrase here";
const wallet = ethers.Wallet.fromPhrase(mnemonic);
console.log("Private Key:", wallet.privateKey);
```

## Verification

Your private key should:
- ✅ Start with `0x`
- ✅ Be exactly 66 characters long
- ✅ Contain only hexadecimal characters (0-9, a-f, A-F)
- ✅ Look like: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

## Common Mistakes

❌ **Wrong**: `034...` (This is likely a public key or different format)
❌ **Wrong**: `5K...` (This is WIF format, not Ethereum)
❌ **Wrong**: `L1...` (This is WIF format, not Ethereum)

✅ **Correct**: `0x1234...` (Ethereum private key in hex)

## Still Having Issues?

1. **Check your wallet type**: Make sure you're using an Ethereum-compatible wallet
2. **Look for "Export Private Key"**: Different wallets have different export options
3. **Use MetaMask**: MetaMask clearly shows the private key in the correct format
4. **Check wallet documentation**: Your specific wallet may have different export methods

## Security Reminder

⚠️ **NEVER**:
- Share your private key
- Commit it to git
- Use it on untrusted websites
- Use a mainnet account for testing

✅ **ALWAYS**:
- Use a dedicated testnet account
- Keep `.env` file secure
- Verify it's a testnet account before using

## Quick Test

Once you have your private key, test it:

```bash
# This will show if the key format is correct
node -e "const ethers = require('ethers'); const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY'); console.log('Address:', wallet.address);"
```

If this works, your private key is in the correct format! ✅

