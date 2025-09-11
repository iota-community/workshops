import { Flex, Card, Text, TextField } from "@radix-ui/themes";
import { useWKTContract } from "../hooks/useWKTContract";
import Button from "./molecules/Button";
import { useState, useEffect } from "react";
import { TokenBalance } from "../types";

export default function MakePayment() {
  const { account, makePayment, getWKTBalance } = useWKTContract();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [coinId, setCoinId] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<TokenBalance[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBalance = async () => {
      if (account?.address) {
        const userBalance = await getWKTBalance(account.address);
        setBalance(userBalance);
        if (userBalance.length > 0) {
          setCoinId(userBalance[0].coinObjectId);
        }
      }
    };
    fetchBalance();
  }, [account?.address]);

  const handlePayment = async () => {
    if (!account || !recipient || !amount || !coinId) return;
    
    setLoading(true);
    try {
      await makePayment(coinId, recipient, amount);
      setMessage("Payment successful!");
      setRecipient("");
      setAmount("");
      
      // Refresh balance
      const userBalance = await getWKTBalance(account.address);
      setBalance(userBalance);
    } catch (error) {
      console.error("Failed to make payment:", error);
      setMessage("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = balance.reduce((sum, coin) => sum + BigInt(coin.balance), BigInt(0));

  return (
    <Flex direction="column" align="center" gap="4" style={{ padding: "20px" }}>
      <Card style={{ padding: "20px", background: "#1a1a1a", minWidth: "300px" }}>
        <Text size="4" weight="bold">Make Payment</Text>

      <div style={{padding: "20px"}}>
        <Text size="2" weight="bold">Current Balance: {totalBalance.toString()} WKT</Text>
       </div> 
        <TextField.Root
          placeholder="Recipient address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          style={{ margin: "10px 0" }}
        />
        
        <TextField.Root
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ margin: "10px 0" }}
        />
        
        <Button 
          onClick={handlePayment} 
          disabled={loading || !account || !recipient || !amount || !coinId}
        >
          {loading ? "Processing..." : "Make Payment"}
        </Button>
        
        {message && (
          <Text color={message.includes("success") ? "green" : "red"} style={{ marginTop: "10px" }}>
            {message}
          </Text>
        )}
      </Card>
    </Flex>
  );
}