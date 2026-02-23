"use client";

import NextTopLoader from "nextjs-toploader";

export default function TopLoaderProvider() {
  return (
    <NextTopLoader
      color="#5e5ce6"
      initialPosition={0.08}
      crawlSpeed={200}
      height={8}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px #2299DD,0 0 5px #2299DD"
      zIndex={1600}
      showAtBottom={false}
    />
  );
}
