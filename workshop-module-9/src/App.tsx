import React, { useState } from 'react';
import {
  ConnectButton,
  useWallets,
  useIotaClient,
  useSignTransaction,
} from '@iota/dapp-kit';
import { Transaction } from '@iota/iota-sdk/transactions';
import axios from 'axios';

// ——— CONFIG ———
const GAS_STATION_URL = 'http://localhost:9527';
const GAS_STATION_AUTH = 'supersecret123';
const PACKAGE_ID = '0x7777e9f8c6d4b2a0987654321098765432109876543210987654321098765432';

// ——— TYPES ———
interface Post {
  content: string;
  author: string;
  txid: string;
  timestamp: number;
}

// ——— HELPER: Safe error message extractor ———
const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { error?: string } } };
    return axiosErr.response?.data?.error ?? 'Request failed';
  }
  return String(err) || 'Transaction failed';
};

// ——— MAIN COMPONENT ———
export default function App() {
  const wallets = useWallets();
  const client = useIotaClient();
  const { mutateAsync: signTransaction } = useSignTransaction();

  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Connection detection
  const connectedWallet = wallets.find(w => w.accounts.length > 0);
  const isConnected = !!connectedWallet;
  const address = connectedWallet?.accounts[0]?.address ?? null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handlePost = async () => {
    if (!isConnected || !address || !content.trim()) {
      showToast('Connect your wallet and write a spark first!');
      return;
    }

    setLoading(true);
    try {
      // 1. Build transaction
      const tx = new Transaction();
      tx.setSender(address);
      tx.moveCall({
        target: `${PACKAGE_ID}::media::post_message`,
        arguments: [tx.pure.string(content)],
      });

      // 2. Reserve gas from Gas Station
      const gasBudget = 50_000_000;
      const reserveRes = await axios.post(
        `${GAS_STATION_URL}/v1/reserve_gas`,
        { gas_budget: gasBudget, reserve_duration_secs: 15 },
        { headers: { Authorization: `Bearer ${GAS_STATION_AUTH}` } }
      );

      const { sponsor_address, reservation_id, gas_coins } = reserveRes.data.result;

      // 3. Attach sponsor gas
      tx.setGasOwner(sponsor_address);
      tx.setGasPayment(gas_coins);
      tx.setGasBudget(gasBudget);

      // 4. Build unsigned bytes
      const unsignedTxBytes = await tx.build({ client });

      // 5. User signs via wallet popup
      const { signature, reportTransactionEffects } = await signTransaction({
        transaction: tx,
      });

      // 6. Send to Gas Station for co-sign + submit
      const executeRes = await axios.post(`${GAS_STATION_URL}/v1/execute_tx`, {
        reservation_id,
        tx_bytes: btoa(String.fromCharCode(...new Uint8Array(unsignedTxBytes))),
        user_sig: signature,
      });

      const txDigest = executeRes.data.effects.transactionDigest;

      // 7. Report success to wallet
      reportTransactionEffects(executeRes.data.effects);

      // 8. Update UI
      setPosts(prev => [
        {
          content,
          author: address.slice(0, 10) + '...',
          txid: txDigest,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
      setContent('');
      showToast('Spark posted on-chain!');

    } catch (err) {
      console.error('Post failed:', err);
      showToast('Failed: ' + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'system-ui', lineHeight: 1.6 }}>
      <h1>Spark Mini</h1>
      <p>Gas-free microblogging on IOTA testnet</p>

      {!isConnected ? (
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <h2>Connect your wallet to start posting</h2>
          <ConnectButton />
          {/* ConnectModal is no longer needed — ConnectButton opens it automatically */}
        </div>
      ) : (
        <>
          <p>
            Connected: {address!.slice(0, 12)}...{address!.slice(-8)}
          </p>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's your spark? (max 280 chars)"
            maxLength={280}
            rows={4}
            style={{
              width: '100%',
              padding: 14,
              fontSize: 16,
              borderRadius: 8,
              border: '1px solid #ccc',
              marginBottom: 16,
            }}
            disabled={loading}
          />

          <div style={{ textAlign: 'right' }}>
            <button
              onClick={handlePost}
              disabled={loading || !content.trim()}
              style={{
                padding: '12px 28px',
                fontSize: 16,
                background: '#0068FF',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              {loading ? 'Posting...' : 'Post Spark'}
            </button>
          </div>

          <hr style={{ margin: '40px 0', borderColor: '#eee' }} />

          <div>
            {posts.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>
                No sparks yet — be the first!
              </p>
            ) : (
              posts.map((p, i) => (
                <div
                  key={i}
                  style={{
                    background: 'white',
                    padding: 18,
                    marginBottom: 16,
                    borderRadius: 12,
                    border: '1px solid #eee',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <strong>{p.author}:</strong> {p.content}
                  <br />
                  <small>
                    <a
                      href={`https://explorer.iota.org/testnet/transaction/${p.txid}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#0068FF' }}
                    >
                      View on Explorer
                    </a>
                  </small>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.9)',
            color: 'white',
            padding: '14px 32px',
            borderRadius: 12,
            fontSize: 16,
            zIndex: 1000,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}