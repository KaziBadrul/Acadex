import ZenLayout from "@/components/zen/ZenLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Zen Mode | Acadex",
    description: "Distraction-free focus environment",
};

export default function ZenPage() {
    return <ZenLayout />;
}
