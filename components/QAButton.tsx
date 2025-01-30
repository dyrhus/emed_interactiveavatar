import { Button } from "@nextui-org/react";
import { useState } from "react";

interface QAButtonProps {
  onStartQA: () => void;
  isDisabled?: boolean;
}

export default function QAButton({ onStartQA, isDisabled }: QAButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onStartQA();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="bg-black text-white hover:bg-gray-900"
      isDisabled={isDisabled}
      isLoading={isLoading}
      size="lg"
      onClick={handleClick}
    >
      Q&A with Emmy
    </Button>
  );
}
