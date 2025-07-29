import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/utils/trpc";
import StreamingTime from "@/components/StreamingTime";

export function HomePage(): React.JSX.Element {
  const { data: users = [], isLoading, error, refetch } = trpc.users.list.useQuery();


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading users with tRPC...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to Your Turborepo Template
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            A modern monorepo with tRPC, Express API, React frontend, PostgreSQL, and TypeScript throughout.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => void refetch()}>
              🔄 Refresh Users (tRPC Query)
            </Button>
            <Button variant="secondary">
              Create Test User
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">
                Error: {error.message || 'Unknown error'}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
            <CardDescription>
              Users from your PostgreSQL database via tRPC
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground">
                No users found. Check the backend logs and database!
              </p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(user.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {user.id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>🔍 Tech Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">📦 <strong>Monorepo:</strong> Turborepo with pnpm workspaces</p>
              <p className="text-sm">🖥️ <strong>Backend:</strong> Express + tRPC + Drizzle ORM</p>
              <p className="text-sm">🌐 <strong>Frontend:</strong> React + Vite + TailwindCSS</p>
              <p className="text-sm">🗄️ <strong>Database:</strong> PostgreSQL with type-safe queries</p>
              <p className="text-sm">🔒 <strong>Type Safety:</strong> End-to-end TypeScript</p>
            </CardContent>
          </Card>

          <StreamingTime />
        </div>
      </div>
    </div>
  );
}
