import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {authOptions} from "./lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect("/login");
  } else {
    return redirect("/recommendationPage");
  }
}
