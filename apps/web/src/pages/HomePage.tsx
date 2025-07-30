import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/utils/trpc";

export function HomePage(): React.JSX.Element {
  const [aiOne, setAiOne] = useState("CodeRapper");
  const [aiTwo, setAiTwo] = useState("AlgoMC");
  const [battleId, setBattleId] = useState("");
  const [message, setMessage] = useState("");
  
  // Backend API state
  const [backendAiOne, setBackendAiOne] = useState("BackendRapper");
  const [backendAiTwo, setBackendAiTwo] = useState("APIFlow");
  const [storedBattleId, setStoredBattleId] = useState("");
  const [backendMessage, setBackendMessage] = useState("");

  const createBattle = trpc.battles.create.useMutation();

  const getBattle = trpc.battles.get.useQuery(
    { battle_id: battleId },
    { enabled: !!battleId.trim() }
  );

  // Backend API hooks
  const createBackendBattle = trpc.battles.create.useMutation();
  
  const getStoredBattle = trpc.battles.get.useQuery(
    { battle_id: storedBattleId },
    { enabled: false } // Only fetch when manually triggered
  );

  const handleCreateBattle = () => {
    if (!aiOne.trim() || !aiTwo.trim()) {
      setMessage("Please enter both AI rapper names");
      return;
    }
    
    const input = {
      ai_one: aiOne.trim(),
      ai_two: aiTwo.trim(),
    };
    
    console.log("Creating battle with input:", input);
    
    createBattle.mutate(input, {
      onSuccess: (data) => {
        setBattleId(data.battle_id ?? '');
        setMessage(`Battle created! ID: ${data.battle_id ?? 'unknown'}`);
      },
      onError: (error) => {
        setMessage(`Error: ${error.message}`);
        console.error("Battle creation error:", error);
      },
    });
  };

  const handleGetInfo = () => {
    if (!battleId.trim()) {
      setMessage("Please enter a battle ID or create a battle first");
      return;
    }
    getBattle.refetch().then(() => {
      if (getBattle.data) {
        console.log("Battle info:", getBattle.data);
        setMessage("Battle info logged to console - check developer tools!");
      }
    }).catch((error) => {
      setMessage(`Error: ${error.message}`);
    });
  };

  // Backend API handlers
  const handleCreateBackendBattle = () => {
    if (!backendAiOne.trim() || !backendAiTwo.trim()) {
      setBackendMessage("Please enter both AI rapper names");
      return;
    }
    
    const input = {
      ai_one: backendAiOne.trim(),
      ai_two: backendAiTwo.trim(),
    };
    
    console.log("Creating backend battle with input:", input);
    
    createBackendBattle.mutate(input, {
      onSuccess: (data) => {
        const newBattleId = data.battle_id ?? '';
        setStoredBattleId(newBattleId);
        setBackendMessage(`Backend battle created! Stored ID: ${newBattleId}`);
      },
      onError: (error) => {
        setBackendMessage(`Backend Error: ${error.message}`);
        console.error("Backend battle creation error:", error);
      },
    });
  };

  const handleQueryStoredBattle = () => {
    if (!storedBattleId.trim()) {
      setBackendMessage("No battle ID stored. Create a backend battle first.");
      return;
    }
    
    getStoredBattle.refetch().then(() => {
      if (getStoredBattle.data) {
        console.log("Stored battle status:", getStoredBattle.data);
        setBackendMessage(`Battle status: ${getStoredBattle.data.status || 'unknown'} - Check console for full details!`);
      }
    }).catch((error) => {
      setBackendMessage(`Query Error: ${error.message}`);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            AI Rap Battle
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Create and query AI rap battles using tRPC
          </p>
        </div>

        {message && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-sm">{message}</p>
            </CardContent>
          </Card>
        )}

        {backendMessage && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-800">{backendMessage}</p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Battle</CardTitle>
            <CardDescription>
              Enter two AI rapper names to create a new battle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ai-one">AI Rapper 1</Label>
                <Input
                  id="ai-one"
                  value={aiOne}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiOne(e.target.value)}
                  placeholder="Enter AI rapper name"
                />
              </div>
              <div>
                <Label htmlFor="ai-two">AI Rapper 2</Label>
                <Input
                  id="ai-two"
                  value={aiTwo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiTwo(e.target.value)}
                  placeholder="Enter AI rapper name"
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateBattle} 
              disabled={createBattle.isPending}
              className="w-full"
            >
              {createBattle.isPending ? "Creating..." : "Create Battle"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get Battle Info</CardTitle>
            <CardDescription>
              Enter a battle ID to get battle information (logged to console)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="battle-id">Battle ID</Label>
              <Input
                id="battle-id"
                value={battleId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBattleId(e.target.value)}
                placeholder="Enter battle ID"
              />
            </div>
            <Button 
              onClick={handleGetInfo} 
              disabled={getBattle.isFetching}
              className="w-full"
              variant="outline"
            >
              {getBattle.isFetching ? "Loading..." : "Get Info (Check Console)"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo Battles</CardTitle>
            <CardDescription>
              Try different battle statuses with pre-made examples
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={() => {
                  setBattleId('battle-1');
                  getBattle.refetch().then(() => {
                    if (getBattle.data) {
                      console.log("Battle info:", getBattle.data);
                      setMessage("Pending battle info logged to console!");
                    }
                  }).catch((error) => {
                    setMessage(`Error: ${error.message}`);
                  });
                }}
                variant="secondary"
                className="justify-start"
              >
                📝 Pending Battle (battle-1)
              </Button>
              
              <Button 
                onClick={() => {
                  setBattleId('battle-2');
                  getBattle.refetch().then(() => {
                    if (getBattle.data) {
                      console.log("Battle info:", getBattle.data);
                      setMessage("Generating battle info logged to console!");
                    }
                  }).catch((error) => {
                    setMessage(`Error: ${error.message}`);
                  });
                }}
                variant="secondary" 
                className="justify-start"
              >
                ⚡ Generating Battle (battle-2)
              </Button>
              
              <Button 
                onClick={() => {
                  setBattleId('battle-3');
                  getBattle.refetch().then(() => {
                    if (getBattle.data) {
                      console.log("Battle info:", getBattle.data);
                      setMessage("Completed battle info logged to console!");
                    }
                  }).catch((error) => {
                    setMessage(`Error: ${error.message}`);
                  });
                }}
                variant="secondary"
                className="justify-start"
              >
                ✅ Completed Battle (battle-3)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backend API Testing</CardTitle>
            <CardDescription>
              Test the actual backend API - creates real battles and stores battle IDs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="backend-ai-one">Backend AI Rapper 1</Label>
                <Input
                  id="backend-ai-one"
                  value={backendAiOne}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBackendAiOne(e.target.value)}
                  placeholder="Enter AI rapper name"
                />
              </div>
              <div>
                <Label htmlFor="backend-ai-two">Backend AI Rapper 2</Label>
                <Input
                  id="backend-ai-two"
                  value={backendAiTwo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBackendAiTwo(e.target.value)}
                  placeholder="Enter AI rapper name"
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateBackendBattle} 
              disabled={createBackendBattle.isPending}
              className="w-full"
            >
              {createBackendBattle.isPending ? "Creating Backend Battle..." : "Create Backend Battle"}
            </Button>
            
            {storedBattleId && (
              <div className="pt-4 border-t">
                <div className="mb-3">
                  <Label className="text-sm font-medium">Stored Battle ID:</Label>
                  <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded mt-1">
                    {storedBattleId}
                  </p>
                </div>
                <Button 
                  onClick={handleQueryStoredBattle} 
                  disabled={getStoredBattle.isFetching}
                  className="w-full"
                  variant="outline"
                >
                  {getStoredBattle.isFetching ? "Querying Status..." : "Query Battle Status"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
