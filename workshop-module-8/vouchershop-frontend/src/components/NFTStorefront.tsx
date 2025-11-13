import { useEffect, useState } from "react";
import { useVoucherShop } from "../hooks/useVoucherShop";
import { NFTMetadata } from "../types";
import Loading from "./molecules/Loading";

export default function NFTStorefront({ onSelect }: { onSelect: (id: number) => void }) {
  const { client, voucherShopObject, packageId } = useVoucherShop();
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const shopObject = await client.getObject({
          id: voucherShopObject,
          options: { showContent: true }
        });

        if (shopObject.data?.content && shopObject.data.content.dataType === 'moveObject') {
          const fields = (shopObject.data.content as any).fields;
          const nftIds = fields.nft_ids || [];
          
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

              if (inspectResult.results?.[0]?.returnValues?.[0]) {
                const rawData = inspectResult.results[0].returnValues[0][0];
                const parsedNfts: NFTMetadata[] = [];
                
                try {
                  let offset = 0;
                  const data = new Uint8Array(rawData);
                  const vectorLength = data[offset];
                  offset += 1;
                  
                  for (let i = 0; i < vectorLength; i++) {
                    const id = data[offset] + (data[offset + 1] << 8) + (data[offset + 2] << 16) + (data[offset + 3] << 24);
                    offset += 8;
                    
                    const nameLength = data[offset]; offset += 1;
                    const name = new TextDecoder().decode(data.slice(offset, offset + nameLength));
                    offset += nameLength;
                    
                    const uriLength = data[offset]; offset += 1;
                    const imageUri = new TextDecoder().decode(data.slice(offset, offset + uriLength));
                    offset += uriLength;
                    
                    const descLength = data[offset]; offset += 1;
                    const description = new TextDecoder().decode(data.slice(offset, offset + descLength));
                    offset += descLength;
                    
                    parsedNfts.push({ id, name, image_uri: imageUri, description });
                  }
                  
                  if (parsedNfts.length > 0) {
                    setNfts(parsedNfts);
                    return;
                  }
                } catch (parseError) {
                  console.error('Parse error:', parseError);
                }
              }
            } catch (inspectError) {
              console.log('DevInspect failed:', inspectError);
            }
          } else {
            setError("No NFT templates available");
          }
        } else {
          setError("Could not fetch shop data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load NFTs");
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [client, voucherShopObject, packageId]);

  // Styles
  const styles = {
    container: {
      padding: "2rem",
      background: "rgba(17, 25, 40, 0.6)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "20px",
      maxWidth: "1100px",
      width: "100%",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "2.5rem"
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.75rem",
      marginBottom: "1rem",
      padding: "0.6rem 1.25rem",
      background: "rgba(255, 255, 255, 0.03)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "40px",
      backdropFilter: "blur(10px)"
    },
    title: {
      color: "#FFFFFF",
      marginBottom: "0.5rem",
      fontSize: "2rem",
      fontWeight: "700",
      background: "linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%)",
      WebkitBackgroundClip: "text" as const,
      WebkitTextFillColor: "transparent" as const
    },
    subtitle: {
      color: "#94A3B8",
      fontSize: "0.95rem",
      margin: 0,
      maxWidth: "400px",
      marginLeft: "auto",
      marginRight: "auto",
      lineHeight: "1.5"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "1.5rem"
    },
    card: (isSelected: boolean) => ({
      cursor: "pointer",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      padding: "1.5rem",
      borderRadius: "16px",
      background: isSelected 
        ? "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)"
        : "rgba(255, 255, 255, 0.02)",
      transition: "all 0.3s ease",
      boxShadow: isSelected 
        ? "0 15px 40px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.2)"
        : "0 4px 20px rgba(0, 0, 0, 0.15)",
      transform: isSelected ? "translateY(-4px)" : "translateY(0)",
      position: "relative" as const,
      overflow: "hidden"
    }),
    idBadge: {
      position: "absolute" as const,
      top: "1rem",
      right: "1rem",
      background: "rgba(11, 3, 31, 0.64)",
      color: "#ecebf3ff",
      padding: "0.3rem 0.7rem",
      borderRadius: "12px",
      fontSize: "0.75rem",
      fontWeight: "600",
      border: "1px solid rgba(251, 249, 253, 0.98)",
      zIndex: 4
    },
    imageContainer: {
      textAlign: "center" as const,
      marginBottom: "1.25rem",
      borderRadius: "12px",
      overflow: "hidden",
      background: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
      border: "1px solid rgba(255, 255, 255, 0.08)"
    },
    image: (isSelected: boolean) => ({
      width: "100%",
      height: "180px",
      objectFit: "cover" as const,
      transition: "transform 0.3s ease",
      transform: isSelected ? "scale(1.05)" : "scale(1)"
    }),
    nftName: {
      margin: "0 0 0.5rem 0",
      color: "#FFFFFF",
      fontSize: "1.1rem",
      fontWeight: "600",
      textAlign: "center" as const
    },
    description: {
      margin: "0 0 1.25rem 0",
      color: "#94A3B8",
      fontSize: "0.85rem",
      lineHeight: "1.5",
      textAlign: "center" as const,
      minHeight: "60px",
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical" as const,
      overflow: "hidden"
    },
    actionButton: (isSelected: boolean) => ({
      padding: "0.75rem",
      background: isSelected 
        ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)"
        : "rgba(139, 92, 246, 0.1)",
      borderRadius: "10px",
      textAlign: "center" as const,
      color: isSelected ? "#E2E8F0" : "#CBD5E1",
      border: `1px solid ${isSelected ? "rgba(139, 92, 246, 0.4)" : "rgba(139, 92, 246, 0.2)"}`,
      fontWeight: "600",
      fontSize: "0.85rem",
      transition: "all 0.3s ease"
    })
  };

  if (loading) return (
    <div style={styles.container}>
      <Loading />
    </div>
  );
  
  if (error) return (
    <div style={{
      padding: "2rem",
      background: "rgba(239, 68, 68, 0.08)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(239, 68, 68, 0.2)",
      borderRadius: "16px",
      maxWidth: "1000px",
      width: "100%",
      textAlign: "center"
    }}>
      <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
      <h3 style={{ color: "#FCA5A5", marginBottom: "1rem", fontSize: "1.2rem" }}>
        Collection Unavailable
      </h3>
      <p style={{ color: "#94A3B8", marginBottom: "1rem", fontSize: "0.9rem" }}>
        {error}
      </p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.badge}>
          <div style={{
            width: "32px",
            height: "32px",
            background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <span style={{ fontSize: "1rem", color: "white" }}>🖼️</span>
          </div>
          <span style={{ color: "#E2E8F0", fontSize: "0.85rem", fontWeight: "500" }}>
            {nfts.length} Items Available
          </span>
        </div>

        <h2 style={styles.title}>NFT Storefront</h2>
        <p style={styles.subtitle}>
          Browse and select from our exclusive digital collection
        </p>
      </div>
      
      {/* NFT Grid */}
      {nfts.length === 0 ? (
        <div style={{ 
          textAlign: "center",
          padding: "3rem 2rem",
          background: "rgba(255, 255, 255, 0.02)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.05)"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>🎭</div>
          <p style={{ color: "#E2E8F0", marginBottom: "0.5rem" }}>No Items Available</p>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
            Check back later for new additions
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {nfts.map((nft) => {
            const isSelected = selectedCard === nft.id;
            return (
              <div 
                key={nft.id} 
                onClick={() => {
                  onSelect(nft.id);
                  setSelectedCard(nft.id);
                  setTimeout(() => setSelectedCard(null), 300);
                }}
                onMouseEnter={() => setSelectedCard(nft.id)}
                onMouseLeave={() => setSelectedCard(null)}
                style={styles.card(isSelected)}
              >
                <div style={styles.idBadge}>#{nft.id}</div>

                <div style={styles.imageContainer}>
                  <img 
                    src={nft.image_uri} 
                    alt={nft.name} 
                    style={styles.image(isSelected)}
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMTExMTExIi8+CjxwYXRoIGQ9Ik05NSA4MEgxODVWMTEwSDk1VjgwWiIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIxNDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ORlQ8L3RleHQ+Cjwvc3ZnPgo=";
                    }}
                  />
                </div>

                <h3 style={styles.nftName}>{nft.name}</h3>
                <p style={styles.description}>{nft.description}</p>

                <div style={styles.actionButton(isSelected)}>
                  Select to Redeem
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Store Stats */}
      {nfts.length > 0 && (
        <div style={{
          marginTop: "2.5rem",
          padding: "1.25rem",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "14px",
          textAlign: "center"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#8B5CF6", fontSize: "1.25rem", fontWeight: "700" }}>
                {nfts.length}
              </div>
              <div style={{ color: "#94A3B8", fontSize: "0.75rem", fontWeight: "500" }}>
                In Stock
              </div>
            </div>
            <div style={{ width: "1px", height: "25px", background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#3B82F6", fontSize: "1.25rem", fontWeight: "700" }}>
                {nfts.length}
              </div>
              <div style={{ color: "#94A3B8", fontSize: "0.75rem", fontWeight: "500" }}>
                Unique
              </div>
            </div>
            <div style={{ width: "1px", height: "25px", background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#10B981", fontSize: "1.25rem", fontWeight: "700" }}>
                {nfts.length}
              </div>
              <div style={{ color: "#94A3B8", fontSize: "0.75rem", fontWeight: "500" }}>
                Available
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}