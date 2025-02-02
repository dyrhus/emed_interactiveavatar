"use client";

import { useEffect, useState } from "react";
import { logger } from '@/app/lib/logger';
import { Card, Input, Button, Spinner } from "@nextui-org/react";
import InteractiveAvatar from "@/components/InteractiveAvatar";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

interface DemoConfig {
  customerName: string;
  introScript: string;
  outroScript: string;
  includeQA: boolean;
  password?: string;
}

export default function DemoPage({ params }: { params: { id: string } }) {
  const [demoConfig, setDemoConfig] = useState<DemoConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDemoConfig = async () => {
      logger.log('[DemoPage] Fetching demo config for ID:', params.id);
      try {
        const response = await fetch(`/api/demos/${params.id}`);
        if (!response.ok) throw new Error("Demo not found");
        const data = await response.json();
        setDemoConfig(data);
        setIsAuthenticated(!data.password);
      } catch (err) {
        setError("Failed to load demo");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDemoConfig();
  }, [params.id]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.log('[DemoPage] Attempting password verification');
    try {
      const response = await fetch(`/api/demos/${params.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setError("Incorrect password");
      }
    } catch (err) {
      setError("Failed to verify password");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!demoConfig) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="p-6">
          <h1 className="text-xl font-bold mb-2">Demo Not Found</h1>
          <p>The requested demo could not be found.</p>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="p-6 w-full max-w-md">
          <h1 className="text-xl font-bold mb-4">Enter Password</h1>
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!error}
                errorMessage={error}
              />
              <Button type="submit" className="w-full">
                Access Demo
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Hero />
      <section id="interactive" className="w-full py-16 bg-[hsl(221.54,100%,97.45%)]">
        <div className="container mx-auto px-4">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">
              Demo for {demoConfig.customerName}
            </h1>
            <InteractiveAvatar 
              initialScript={demoConfig.introScript}
              outroScript={demoConfig.outroScript}
              includeQA={demoConfig.includeQA}
            />
          </Card>
        </div>
      </section>
    </div>
  );
}
