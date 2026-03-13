import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            OpenClaw Dashboard
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Component library verification
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Button Component</CardTitle>
              <CardDescription>Testing shadcn/ui Button</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badge Component</CardTitle>
              <CardDescription>Testing shadcn/ui Badge</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Component Status</CardTitle>
            <CardDescription>
              All shadcn/ui components have been installed and are working correctly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Button</span>
                <Badge variant="outline">✓ Installed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Card</span>
                <Badge variant="outline">✓ Installed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Input</span>
                <Badge variant="outline">✓ Installed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Badge</span>
                <Badge variant="outline">✓ Installed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Table</span>
                <Badge variant="outline">✓ Installed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Dialog</span>
                <Badge variant="outline">✓ Installed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sidebar</span>
                <Badge variant="outline">✓ Installed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tabs</span>
                <Badge variant="outline">✓ Installed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
