import { useEffect, useState } from "react";
import { useVoucherShop } from "../hooks/useVoucherShop";
import { NFTMetadata } from "../types";
import Loading from "./molecules/Loading";

export default function NFTStorefront({ onSelect }: { onSelect: (id: number) => void }) {
  const { client, voucherShopObject, packageId } = useVoucherShop();
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching NFTs from contract...');
        
        const shopObject = await client.getObject({
          id: voucherShopObject,
          options: { showContent: true }
        });

        if (shopObject.data?.content && shopObject.data.content.dataType === 'moveObject') {
          const fields = (shopObject.data.content as any).fields;
          console.log('Shop object fields:', fields);
          
          const nftIds = fields.nft_ids || [];
          console.log('Available NFT IDs:', nftIds);
          
          if (nftIds.length > 0) {
            try {
              const tx = await import("@iota/iota-sdk/transactions").then(m => new m.Transaction());
              tx.moveCall({
                target: `${packageId}::voucher_shop::view_available_nfts`,
                arguments: [tx.object(voucherShopObject)]
              });

              const inspectResult = await client.devInspectTransactionBlock({
                transactionBlock: tx,
                sender: "0x0000000000000000000000000000000000000000000000000000000000000000"
              });

              console.log('DevInspect result:', inspectResult);

              if (inspectResult.results && inspectResult.results.length > 0) {
                const returnValues = inspectResult.results[0]?.returnValues;
                if (returnValues && returnValues.length > 0) {
                  console.log('Raw return values:', returnValues);
                  
                  // Parse the BCS encoded NFTMetadata vector
                  const rawData = returnValues[0][0];
                  console.log('Raw NFT data:', rawData);
                 
                  const parsedNfts: NFTMetadata[] = [];
                  
                  try {
                    
                    let offset = 0;
                    const data = new Uint8Array(rawData);
                    
                    // Read vector length (first byte)
                    const vectorLength = data[offset];
                    offset += 1;
                    console.log('Vector length:', vectorLength);
                    
                    // Parse each NFTMetadata struct
                    for (let i = 0; i < vectorLength; i++) {
                      // Read ID (u64 - 8 bytes, little endian)
                      const id = data[offset] + (data[offset + 1] << 8) + (data[offset + 2] << 16) + (data[offset + 3] << 24);
                      offset += 8; 
                      // Read name string
                      const nameLength = data[offset];
                      offset += 1;
                      const nameBytes = data.slice(offset, offset + nameLength);
                      const name = new TextDecoder().decode(nameBytes);
                      offset += nameLength;
                      
                      // Read image_uri string
                      const uriLength = data[offset];
                      offset += 1;
                      const uriBytes = data.slice(offset, offset + uriLength);
                      const imageUri = new TextDecoder().decode(uriBytes);
                      offset += uriLength;
                      
                      // Read description string
                      const descLength = data[offset];
                      offset += 1;
                      const descBytes = data.slice(offset, offset + descLength);
                      const description = new TextDecoder().decode(descBytes);
                      offset += descLength;
                      
                      parsedNfts.push({
                        id,
                        name,
                        image_uri: imageUri,
                        description
                      });
                      
                      console.log(`Parsed NFT ${id}:`, { id, name, imageUri, description });
                    }
                    
                    if (parsedNfts.length > 0) {
                      console.log('Successfully parsed NFTs:', parsedNfts);
                      setNfts(parsedNfts);
                      return;
                    }
                  } catch (parseError) {
                    
                  }
                }
              }
            } catch (inspectError) {
              console.log('DevInspect failed, falling back to manual approach:', inspectError);
            }
            
            
          } else {
            setError("No NFT templates available in the catalog");
          }
        } else {
          setError("Could not fetch shop object data");
        }

      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setError(err instanceof Error ? err.message : "Failed to load NFTs");
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [client, voucherShopObject, packageId]);

  if (loading) return <Loading />;
  
  if (error) {
    return (
      <div>
        <p>Error loading NFTs: {error}</p>
        <p>
          You can check available NFTs on the{' '}
          <a 
            href={`https://explorer.iota.org/object/${voucherShopObject}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'blue', textDecoration: 'underline' }}
          >
            IOTA Explorer
          </a>
        </p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#121212", padding: "2rem", borderRadius: "12px" }}>
      <h2 style={{ color: "#ffffff", marginBottom: "1.5rem", textAlign: "center" }}>Available NFTs</h2>
      {nfts.length === 0 ? (
        <div style={{ color: "#bbb", textAlign: "center" }}>
          <p>No NFTs available.</p>
          <p>
            Check the{' '}
            <a 
              href={`https://explorer.iota.org/object/${voucherShopObject}?network=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
              IOTA Explorer
            </a>
            {' '}to verify NFT catalog.
          </p>
        </div>
      ) : (
        <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "1.5rem",
    justifyContent: "center",
    marginTop: "1rem",
  }}
>
          {nfts.map((nft) => (
            <div 
              key={nft.id} 
              onClick={() => onSelect(nft.id)} 
              style={{ 
                cursor: "pointer",
    border: "2px solid #222",
    padding: "1rem",
    borderRadius: "12px",
    backgroundColor: "#1e1e1e",
    width: "220px",
    transition: "all 0.3s ease",
    boxShadow: "0 0 10px rgba(0,0,0,0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#4dabf7";
                e.currentTarget.style.boxShadow = "0 0 15px rgba(77,171,247,0.7)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#222";
                e.currentTarget.style.boxShadow = "0 0 10px rgba(0,0,0,0.4)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <img 
                  src={nft.image_uri} 
                  alt={nft.name} 
                  style={{ 
                    width: "100%", 
                    height: "160px", 
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #444"
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzMzMzMzIi8+Cjx0ZXh0IHg9IjYwIiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ORlQ8L3RleHQ+Cjwvc3ZnPgo=";
                  }}
                />
              </div>
              <h3 style={{ margin: "0.5rem 0", color: "#ffffff", fontSize: "1.1rem" }}>{nft.name}</h3>
              <p style={{ margin: "0.5rem 0", color: "#bbb", fontSize: "0.9rem" }}>{nft.description}</p>
              <div
  style={{
    marginTop: "0.8rem",
    padding: "0.5rem",
    backgroundColor: "#2a2a2a",
    borderRadius: "6px",
    textAlign: "center",
    color: "#ddd",
  }}
>
  Template ID: {nft.id}
</div>
              <div
  style={{
    marginTop: "0.6rem",
    padding: "0.6rem",
    backgroundColor: "#4dabf7",
    borderRadius: "6px",
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  }}
>
  Click to Select
</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}