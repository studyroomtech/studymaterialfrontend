import { headers } from "next/headers";

export const isMobile = async (): Promise<boolean> => {
  const headersList = await headers();

  return /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    headersList.get("user-agent") ?? "",
  );
};