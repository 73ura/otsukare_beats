// 共通ログ処理
import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    // エラーログ
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      options: { encoding: "utf8" },
    }),
    // 全てのログ
    new transports.File({
      filename: "logs/combined.log",
    }),
  ],
});
