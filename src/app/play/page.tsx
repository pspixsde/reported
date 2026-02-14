import { redirect } from "next/navigation";

/**
 * /play route — currently redirects to home where the game lives.
 * Reserved for future use if we separate the game into its own route.
 */
export default function PlayPage() {
  redirect("/");
}
