import { redirect } from "next/navigation";

// Land users in a platform. Whatnot is the default (it has live data today).
export default function Home() {
  redirect("/whatnot");
}
