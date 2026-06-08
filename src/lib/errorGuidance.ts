export function deploymentErrorGuidance(message: string) {
  if (message.includes("DATABASE_URL")) {
    return "VercelのEnvironment VariablesにDATABASE_URLが設定されているか確認してください。";
  }
  if (message.includes("AUTH_SECRET")) {
    return "AUTH_SECRETに十分長いランダム文字列を設定し、再デプロイしてください。";
  }
  if (message.includes("NEXTAUTH_URL") || message.includes("AUTH_URL")) {
    return "本番URLとNEXTAUTH_URL / AUTH_URLが一致しているか確認してください。";
  }
  if (message.includes("Prisma") || message.includes("database") || message.includes("DB")) {
    return "DATABASE_URL、Prisma Client生成、migration適用状況を確認してください。";
  }
  if (message.includes("招待")) {
    return "招待リンクが無効化済み、期限切れ、またはチーム削除済みでないか確認してください。";
  }
  if (message.includes("権限") || message.includes("403")) {
    return "チームのロールが操作に必要な権限を満たしているか確認してください。";
  }
  if (message.includes("セッション") || message.includes("ログイン")) {
    return "再ログインしてから同じ操作を試してください。";
  }
  if (message.includes("画像") || message.includes("PNG")) {
    return "ブラウザの画像保存権限、表示中の出力カード、端末の空き容量を確認してください。";
  }
  if (message.includes("CSV")) {
    return "対象データが存在するか確認し、別ブラウザでもCSV出力を試してください。";
  }
  if (message.includes("共有")) {
    return "Web Share API非対応環境ではコピー権限が必要です。ブラウザのクリップボード許可を確認してください。";
  }
  return "設定と入力内容を確認し、再度実行してください。";
}
