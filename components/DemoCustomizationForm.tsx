import { Button, Input, Textarea } from "@nextui-org/react";
import { useState } from "react";

interface DemoFormData {
  customerName: string;
  introScript: string;
  outroScript: string;
  includeQA: boolean;
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
    includeQA: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[DemoForm] Submitting form data:', formData);
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
      <div className="flex items-center gap-2 py-2">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-black rounded border-gray-300"
            checked={formData.includeQA}
            onChange={(e) => setFormData({ ...formData, includeQA: e.target.checked })}
          />
          <span className="ml-2">Include Q&A with live AI Avatar?</span>
        </label>
      </div>
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
