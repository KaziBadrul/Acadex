import NeuralNexus from "@/components/nexus/NeuralNexus";

export const metadata = {
    title: "Neural Nexus | Acadex",
    description: "Visualize your second brain.",
};

export default function NexusPage() {
    return (
        <div className="w-full h-screen">
            <NeuralNexus />
        </div>
    );
}
