"use client";

import DemoCustomizationForm from "@/components/DemoCustomizationForm";
import { logger } from '@/app/lib/logger';
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleDemoGeneration = async (formData: {
    customerName: string;
    introScript: string;
    outroScript: string;
    includeQA: boolean;
    password?: string;
  }) => {
    try {
      logger.log('[Home] Generating demo with config:', formData);
      const response = await fetch('/api/generate-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate demo');
      }

      const data = await response.json();
      if (!data.success || !data.demoId) {
        throw new Error(data.message || 'Invalid demo response');
      }
      router.push(`/demo/${data.demoId}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate demo');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">Create Custom Demo</h1>
        <DemoCustomizationForm onSubmit={handleDemoGeneration} />
        </div>
      </div>
    </div>
  );
}
