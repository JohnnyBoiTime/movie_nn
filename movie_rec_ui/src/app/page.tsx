'use client';
import Link from "next/link"
// import { getServerSession } from "next-auth";
// import { authOptions } from "./lib/auth";
// import { redirect } from "next/navigation";

// Landing page
export default function Home() {
    return (
      <main>
        <h1>
          Welcome to movie-nn!! A pre-trained neural network to help you find movies you might like.
        </h1>
          <Link href="/login" style={{textDecoration: 'underline'}}>
            Go to login!                
          </Link>
      </main>
    )
}
