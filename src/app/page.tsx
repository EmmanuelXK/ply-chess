import { HomeScreen } from "@/components/home/home-screen";
import { openings } from "@/lib/openings";

export default function HomePage() {
  return <HomeScreen openings={openings} />;
}
