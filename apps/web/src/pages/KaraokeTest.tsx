import { useState } from "react";
import { KaraokeBox } from "@/components/KaraokeBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { karaokeTestVerse, karaokeTestVerse2, realMockVerse } from "@/data/karaokeTestData";

export function KaraokeTest(): React.JSX.Element {
  const [selectedVerse, setSelectedVerse] = useState(0);
  
  const testVerses = [realMockVerse, karaokeTestVerse, karaokeTestVerse2];
  const currentVerse = testVerses[selectedVerse];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            🎤 Karaoke Test Mode
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Testing the karaoke component with mock timing data
          </p>
        </div>

        {/* Test Verse Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Verses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {testVerses.map((verse, index) => (
                <Button
                  key={index}
                  variant={selectedVerse === index ? "default" : "outline"}
                  onClick={() => {
                      setSelectedVerse(index);
                    }}
                >
                  {verse.ai} - {verse.duration/1000}s
                </Button>
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p><strong>Current verse:</strong> {currentVerse?.ai}</p>
              <p><strong>Duration:</strong> {currentVerse ? currentVerse.duration/1000 : 0} seconds</p>
              <p><strong>Sections:</strong> {currentVerse?.lyrics_sections.length ?? 0}</p>
              <p><strong>Lines:</strong> {currentVerse?.lyrics_sections.reduce((acc, section) => acc + (section.lines?.length ?? 0), 0) ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Karaoke Component */}
        {currentVerse && <KaraokeBox verse={currentVerse} />}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🧪 Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">How to Test</h4>
                <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Click Play to start the verse (note: audio is placeholder)</li>
                  <li>Watch words highlight in yellow as they &quot;play&quot;</li>
                  <li>Use the scrub bar to jump to different timestamps</li>
                  <li>Try the section buttons to jump to verse/intro</li>
                  <li>Switch between test verses to see different timing patterns</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Timing Details</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p><strong>CodeRapper:</strong> Real Mureka audio (154s)</p>
                    <p>Complex rap lyrics with actual timing</p>
                  </div>
                  <div>
                    <p><strong>TestMC:</strong> Simple 1-second-per-word timing</p>
                    <p>5 lines with predictable rhythm</p>
                  </div>
                  <div>
                    <p><strong>FlowBot:</strong> Variable timing with fast/slow sections</p>
                    <p>Intro + verse with different rhythms</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                <p className="text-sm font-medium">💡 Note for Development</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This uses mock data with placeholder audio. When real lyric/timing generation is ready, 
                  simply pass the actual Verse object to the KaraokeBox component.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
