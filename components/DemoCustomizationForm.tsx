import { Button, Input, Textarea } from "@nextui-org/react";
import { useState } from "react";

interface DemoFormData {
  customerName: string;
  introScript: string;
  outroScript: string;
  password?: string;
}

interface DemoCustomizationFormProps {
  onSubmit: (data: DemoFormData) => void;
  isLoading?: boolean;
}

export default function DemoCustomizationForm({ onSubmit, isLoading }: DemoCustomizationFormProps) {
  const [formData, setFormData] = useState<DemoFormData>({
    customerName: "",
    introScript: "",
    outroScript: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
      <Input
        label="Customer Name"
        placeholder="Enter customer name"
        value={formData.customerName}
        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
        required
      />
      <Textarea
        label="Intro Script"
        placeholder="Enter introduction script"
        value={formData.introScript}
        onChange={(e) => setFormData({ ...formData, introScript: e.target.value })}
        required
      />
      <Textarea
        label="Outro Script"
        placeholder="Enter closing script"
        value={formData.outroScript}
        onChange={(e) => setFormData({ ...formData, outroScript: e.target.value })}
        required
      />
      <Input
        type="password"
        label="Password (Optional)"
        placeholder="Set a password for the demo"
        value={formData.password || ""}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <Button
        type="submit"
        className="bg-black text-white hover:bg-gray-900"
        isLoading={isLoading}
      >
        Generate Demo
      </Button>
    </form>
  );
}
