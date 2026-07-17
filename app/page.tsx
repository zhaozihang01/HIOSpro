import Header from "@/components/Header";
import HomeClient from "@/components/HomeClient";

export default function Home() {
  return (
    <main
      style={{
        maxWidth: "1400px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <Header />
      <HomeClient />
    </main>
  );
}
