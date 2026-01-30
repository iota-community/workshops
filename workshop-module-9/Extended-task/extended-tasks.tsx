import {
  ConnectButton,
  useIotaClient,
  useSignTransaction,
  useWallets,
} from '@iota/dapp-kit';
import { Transaction } from '@iota/iota-sdk/transactions';
import axios from 'axios';
import { useState } from 'react';

// ——— CONFIG ———
const GAS_STATION_URL = '/api/gas';
const GAS_STATION_AUTH = 'supersecret123';
const PACKAGE_ID = '0x2';

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
    // 1. Build the transaction (gas-less at this point)
    const tx = new Transaction();
    tx.setSender(address);
    tx.moveCall({
      target: `${PACKAGE_ID}::media::post_message`,
      arguments: [tx.pure.string(content)], // Official way to pass strings
    });

    // 2. Reserve gas from your Gas Station
    const gasBudget = 50_000_000;
    const reserveRes = await axios.post(
      `${GAS_STATION_URL}/v1/reserve_gas`,
      { gas_budget: gasBudget, reserve_duration_secs: 120 },
      { headers: { Authorization: `Bearer ${GAS_STATION_AUTH}` } }
    );

    const { sponsor_address, reservation_id, gas_coins } = reserveRes.data.result;

    // 3. Attach sponsor's gas data
    tx.setGasOwner(sponsor_address);
    tx.setGasPayment(gas_coins);
    tx.setGasBudget(gasBudget);

    // 4. Build unsigned transaction bytes (needed for Gas Station)
    const unsignedTxBytes = await tx.build({ client });

    // 5. User signs via dApp Kit hook (wallet popup appears)
    const { signature, reportTransactionEffects } = await signTransaction({
      transaction: tx,
    });

    // 6. Send unsigned bytes + user signature to Gas Station for co-sign & submit
    const txBytesBase64 = btoa(String.fromCharCode(...new Uint8Array(unsignedTxBytes)));
    const executeRes = await axios.post(
      `${GAS_STATION_URL}/v1/execute_tx`,
      {
        reservation_id,
        tx_bytes: txBytesBase64,
        user_sig: signature,
      },
      { headers: { Authorization: `Bearer ${GAS_STATION_AUTH}` } }
    );

    const txDigest = executeRes.data.effects.transactionDigest;

    // 7. Report effects back to the wallet (required by useSignTransaction)
    reportTransactionEffects(executeRes.data.effects);

    // 8. Update the UI
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

    let errorMessage = 'Transaction failed';
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (err && typeof err === 'object' && 'response' in err) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      errorMessage = axiosErr.response?.data?.error ?? 'Request failed';
    }

    showToast('Failed: ' + errorMessage);
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
                      href={`https://explorer.iota.org/?network=testnet&transaction=${p.txid}`}
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

// Extended Tasks

// Extend Post type for richer data
interface Post {
  content: string;
  author: string;
  txid: string;
  timestamp: number;
  likes?: number;       // TODO 1 & 2 will update this
  replies?: string[];   // TODO 3: simple list of reply contents
}

// In App function, add new states if needed
const [selectedPostTxid, setSelectedPostTxid] = useState<string | null>(null); // for replies

// TODO 1: Implement "Like" a post (gas-sponsored)
const handleLike = async (postTxid: string) => {
  if (!isConnected || !address) {
    showToast('Connect your wallet first!');
    return;
  }

  setLoading(true);
  try {
    // Build transaction
    const tx = new Transaction();
    tx.setSender(address);
    tx.moveCall({
      target: `${PACKAGE_ID}::media::like_post`,  // TODO: confirm/adjust function name & args
      arguments: [
        tx.pure.string(postTxid),  // or vector<u8> if txid is bytes
        // potentially more args if needed (e.g., post object ID)
      ],
    });

    // ... Reuse the same gas reservation + sign + execute pattern as handlePost ...
    // (copy-paste/adapt steps 2–7 from handlePost, with similar error handling)

    // On success:
    // Update local state (optimistic update; in production, poll explorer or use events)
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.txid === postTxid ? { ...p, likes: (p.likes || 0) + 1 } : p
      )
    );

    showToast('Liked! 🔥');
  } catch (err) {
    showToast('Like failed: ' + getErrorMessage(err));
  } finally {
    setLoading(false);
  }
};

// TODO 2: Display like button & count in each post card
// (Add inside the posts.map render block, e.g. after <strong>{p.author}:</strong> ...)

<div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
  <button
    onClick={() => handleLike(p.txid)}
    disabled={loading}
    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }}
  >
    ❤️ {p.likes || 0}
  </button>
  {/* Bonus: disable if already liked by user — requires on-chain check or local tracking */}
</div>

// TODO 3: Add simple replies (chain replies to a post)
const handleReply = async (parentTxid: string, replyContent: string) => {
  if (!replyContent.trim()) return;

  // Similar to handlePost / handleLike, but with different Move call
  // ...
  tx.moveCall({
    target: `${PACKAGE_ID}::media::reply_message`,  // TODO: adjust function name/args
    arguments: [
      tx.pure.string(parentTxid),
      tx.pure.string(replyContent),
    ],
  });
  // ... same sponsorship flow ...

  // On success, add to replies array (or fetch full replies if using events)
  setPosts(prev =>
    prev.map(p =>
      p.txid === parentTxid
        ? { ...p, replies: [...(p.replies || []), replyContent] }
        : p
    )
  );
  // Clear input, etc.
};

// In post card render:
{selectedPostTxid === p.txid && (
  <div style={{ marginTop: 12 }}>
    <textarea
      placeholder="Reply to this spark..."
      onChange={/* manage reply input state */}
      // ...
    />
    <button onClick={() => handleReply(p.txid, replyText)}>Reply</button>
  </div>
)}
<button onClick={() => setSelectedPostTxid(p.txid)}>Reply ({p.replies?.length || 0})</button>
{ p.replies?.map((r, i) => <div key={i} style={{ marginLeft: 20, color: '#555' }}>↳ {r}</div>) }