import { useState } from "react";
import { KaraokeBox } from "@/components/KaraokeBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";
import { karaokeTestVerse, karaokeTestVerse2, realMockVerse } from "@/data/karaokeTestData";
import { Verse } from "@/types/battle";

export function KaraokeDemo(): React.JSX.Element {
  const [selectedBattleId, setSelectedBattleId] = useState("battle-3");
  const [selectedVerseIndex, setSelectedVerseIndex] = useState(0);
  const [testMode, setTestMode] = useState(false);

  const getBattle = trpc.battles.get.useQuery(
    { battle_id: selectedBattleId },
    { enabled: !!selectedBattleId }
  );

  const battle = getBattle.data;
  
  // Test mode data
  const testVerses: Verse[] = [realMockVerse, karaokeTestVerse, karaokeTestVerse2];
  
  // Get verse based on mode
  const selectedVerse = testMode 
    ? testVerses[selectedVerseIndex] 
    : battle?.verses[selectedVerseIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            🎤 Karaoke Mode
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Sing along with AI rap battles in real-time with word-by-word highlighting
          </p>
        </div>

        {/* Test Mode Toggle */}
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Demo Mode</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {testMode 
                    ? "Using test data with full karaoke functionality" 
                    : "Using real battle data (may have limited lyrics)"
                  }
                </p>
              </div>
              <Button 
                onClick={() => {
                  setTestMode(!testMode);
                  setSelectedVerseIndex(0);
                }}
                variant={testMode ? "default" : "outline"}
              >
                {testMode ? "🧪 Test Mode" : "🎵 Real Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Battle Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Battle & Verse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {["battle-1", "battle-2", "battle-3"].map((battleId) => (
                <Button
                  key={battleId}
                  variant={selectedBattleId === battleId ? "default" : "outline"}
                  onClick={() => {
                    setSelectedBattleId(battleId);
                    setSelectedVerseIndex(0);
                  }}
                >
                  {battleId === "battle-1" && "📝 Pending"}
                  {battleId === "battle-2" && "⚡ Generating"}
                  {battleId === "battle-3" && "✅ Completed"}
                </Button>
              ))}
            </div>

            {(testMode ? testVerses.length > 0 : battle && battle.verses.length > 0) && (
              <div className="flex gap-2 flex-wrap">
                {(testMode ? testVerses : battle?.verses ?? []).map((verse, index) => (
                  <Button
                    key={index}
                    variant={selectedVerseIndex === index ? "default" : "outline"}
                    onClick={() => {
                      setSelectedVerseIndex(index);
                    }}
                    size="sm"
                  >
                    {verse.ai} - {testMode ? "Test " : ""}Verse {index + 1}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Battle Info */}
        {(testMode || battle) && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  {testMode ? (
                    <>
                      <h3 className="text-lg font-semibold">
                        Test Mode: {testVerses[0]?.ai} vs {testVerses[1]?.ai ?? "Test Opponents"}
                      </h3>
                      <p className="text-muted-foreground">
                        Mock battle data with full karaoke timing • Status: test
                      </p>
                    </>
                  ) : battle && (
                    <>
                      <h3 className="text-lg font-semibold">
                        {battle.ai_one} vs {battle.ai_two}
                      </h3>
                      <p className="text-muted-foreground">
                        Battle ID: {battle.battle_id} • Status: {battle.status}
                        {battle.winner && ` • Winner: ${battle.winner}`}
                      </p>
                    </>
                  )}
                </div>
                <div className="text-2xl">
                  {testMode ? "🧪" : (
                    <>
                      {battle?.status === "pending" && "⏳"}
                      {battle?.status === "generating" && "⚡"}
                      {battle?.status === "completed" && "🏆"}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Karaoke Component */}
        {selectedVerse ? (
          <KaraokeBox verse={selectedVerse} />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-lg font-semibold mb-2">No verses available</h3>
                <p className="text-muted-foreground">
                  {testMode 
                    ? "Switch to test mode to see the karaoke functionality in action!"
                    : battle?.status === "pending" 
                    ? "This battle hasn't started yet. Check back later!"
                    : "Select a completed battle to see karaoke lyrics."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🎯 How to Use Karaoke Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Controls</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Click Play/Pause to control audio</li>
                  <li>• Use the scrub bar to jump to any time</li>
                  <li>• Click section buttons to jump to verse/intro</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Visual Features</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <span className="bg-yellow-300 text-black px-1 rounded">Yellow highlight</span> = current word</li>
                  <li>• <span className="text-green-600">Green text</span> = already sung</li>
                  <li>• <span className="text-muted-foreground">Gray text</span> = coming up</li>
                  <li>• Previous/next lines shown for context</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
