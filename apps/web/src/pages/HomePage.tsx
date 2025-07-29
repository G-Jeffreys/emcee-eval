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

  const createBattle = trpc.battles.create.useMutation();

  const getBattle = trpc.battles.get.useQuery(
    { battle_id: battleId },
    { enabled: !!battleId.trim() }
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
      </div>
    </div>
  );
}
