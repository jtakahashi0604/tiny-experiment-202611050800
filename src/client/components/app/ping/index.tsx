import { Radio } from "lucide-react";
import { useState } from "react";

import { Button } from "@/client/components/ui/button";
import type { PingResponse } from "@/types/ping";
import { request } from "@/utils/api";

export const PingIndex = () => {
  // prettier-ignore
  const [message, setMessage] = useState<string | null>(null);
  // prettier-ignore
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await request<PingResponse>({ path: "/api/ping", method: "POST" });
      setMessage(response.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={handleClick} disabled={loading}>
        <Radio />
        ping
      </Button>
      {message && (
        <p className="rounded-md bg-accent px-2 py-2 font-bold">server says: {message}</p>
      )}
    </div>
  );
};
