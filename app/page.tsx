"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import InteractiveAvatar from "@/components/InteractiveAvatar";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Hero />
      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-[1000px]">
          <InteractiveAvatar />
        </div>
      </section>
    </div>
  );
}
