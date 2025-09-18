// 共通ログ処理
import { createLogger, format, transports } from "winston";

// 本番環境ではコンソール出力のみ、開発環境ではファイル出力も使用
const logTransports = [];

// 常にコンソール出力を追加
logTransports.push(new transports.Console());

// 開発環境でのみファイル出力を追加
if (process.env.NODE_ENV === "development") {
  logTransports.push(
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      options: { encoding: "utf8" },
    }),
    new transports.File({
      filename: "logs/combined.log",
    })
  );
}

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: logTransports,
});
