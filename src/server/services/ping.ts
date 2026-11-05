import type { PingResponse } from "@/types/ping";

export const ping = ({
  logger = console,
}: { logger?: Pick<Console, "log"> } = {}): PingResponse => {
  logger.log("pong");
  return { message: "pong" };
};
