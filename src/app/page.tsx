import { QuickActions } from "@/components/chat/QuickActions";
import { ChatSection } from "@/components/chat/ChatSection";

export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: "#010336" }}
    >
      <main className="flex w-full max-w-4xl flex-col gap-8 sm:gap-12">
        <div className="flex flex-col gap-6">
          <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl lg:text-4xl">
            O que gostaria de criar hoje?
          </h2>
          <QuickActions />
        </div>

        <ChatSection />
      </main>
    </div>
  );
}
