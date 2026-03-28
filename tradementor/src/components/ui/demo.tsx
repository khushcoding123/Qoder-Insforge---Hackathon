import { BackgroundPaths } from "@/components/ui/background-paths";
import { EtherealShadow } from "@/components/ui/etheral-shadow";

export function DemoBackgroundPaths() {
  return <BackgroundPaths title="Background Paths" />;
}

export function DemoOne() {
  return (
    <div className="h-full w-full">
      <EtherealShadow
        className="h-full w-full"
        color="rgba(129, 140, 248, 0.52)"
        animation={{ scale: 92, speed: 84 }}
        noise={{ opacity: 0.16, scale: 1.05 }}
        sizing="fill"
      />
    </div>
  );
}
