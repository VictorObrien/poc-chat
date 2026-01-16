import { ChatContainer } from "@/components/chat/ChatContainer";

export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col items-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: "#010336" }}
    >
      <main className="flex w-full max-w-4xl flex-col">
        <ChatContainer />
      </main>
    </div>
  );
}
