
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { openAIService } from "@/services/openai";

const ApiKeyConfig = () => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="fixed top-4 right-4 bg-white/80 backdrop-blur-sm z-50 group"
      disabled
    >
      <Settings className="h-4 w-4 mr-2 text-green-500" />
      API Configurada
    </Button>
  );
};

export default ApiKeyConfig;

