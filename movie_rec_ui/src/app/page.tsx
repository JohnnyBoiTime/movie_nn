'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
 
  const router = useRouter();

  // Have to wait until the component mounts to redirect
  useEffect(() => {
    router.push("/login");
  }, [router])

  return null;

}
