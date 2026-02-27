"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Share2, Search, Maximize2 } from "lucide-react";

// Dynamic import for the graph library (no SSR)
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-blue-400"><Loader2 className="animate-spin mr-2" /> Initializing Physics Engine...</div>
});

type UnprocessedNote = {
    id: number;
    title: string;
    course: string;
    topic: string;
};

type Node = {
    id: number;
    label: string;
    group: string;
    val: number; // size
};

type Link = {
    source: number;
    target: number;
};

type GraphData = {
    nodes: Node[];
    links: Link[];
};

export default function NeuralNexus() {
    const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const graphRef = useRef<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        async function fetchGraphData() {
            // Get current user
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Fetch ALL notes for this user
            const { data: notes, error } = await supabase
                .from("notes")
                .select("id, title, course, topic")
                .eq("author_id", session.user.id);

            if (error || !notes) {
                console.error(error);
                setLoading(false);
                return;
            }

            // Process Nodes
            const nodes: Node[] = notes.map((n) => ({
                id: n.id,
                label: n.title,
                group: n.course || "General",
                val: 1
            }));

            // Process Links (Heuristic: Same Topic or Same Course)
            const links: Link[] = [];

            // Simple O(N^2) linking for now (fine for < 1000 notes)
            for (let i = 0; i < notes.length; i++) {
                for (let j = i + 1; j < notes.length; j++) {
                    const n1 = notes[i];
                    const n2 = notes[j];

                    let connected = false;

                    // Link if same exact topic (strong connection)
                    if (n1.topic && n2.topic && n1.topic.toLowerCase() === n2.topic.toLowerCase()) {
                        links.push({ source: n1.id, target: n2.id });
                        connected = true;
                    }

                    // Link if same course (weaker connection, maybe only if no topic link?)
                    // For now, let's just link same course too to ensure connectivity
                    if (!connected && n1.course && n2.course && n1.course === n2.course) {
                        links.push({ source: n1.id, target: n2.id });
                    }
                }
            }

            setData({ nodes, links });
            setLoading(false);
        }

        fetchGraphData();
    }, [supabase]);

    const handleNodeClick = (node: any) => {
        // Center graph on node
        if (graphRef.current) {
            graphRef.current.centerAt(node.x, node.y, 1000);
            graphRef.current.zoom(8, 2000);
        }

        // Navigate to note preview/edit
        setTimeout(() => {
            router.push(`/notes/${node.id}`);
        }, 1500); // Wait for zoom animation
    };

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lower = searchTerm.toLowerCase();
        const filteredNodes = data.nodes.filter(n => n.label.toLowerCase().includes(lower) || n.group.toLowerCase().includes(lower));
        const nodeIds = new Set(filteredNodes.map(n => n.id));
        const filteredLinks = data.links.filter(l => nodeIds.has(l.source as number) && nodeIds.has(l.target as number));
        return { nodes: filteredNodes, links: filteredLinks };
    }, [data, searchTerm]);

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
            {/* HUD Overlay */}
            <div className="absolute top-0 left-0 w-full z-10 p-6 flex justify-between items-start pointer-events-none">
                <div>
                    <h1 className="text-3xl font-thin tracking-[0.2em] text-cyan-400 uppercase drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                        Neural Nexus
                    </h1>
                    <p className="text-cyan-500/50 text-xs tracking-widest mt-1">
                        Status: {loading ? "SYNCING..." : "ONLINE"} | Nodes: {data.nodes.length}
                    </p>
                </div>

                <div className="pointer-events-auto flex items-center gap-4 bg-black/40 backdrop-blur-md border border-cyan-500/30 rounded-full px-4 py-2">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="text-cyan-400 hover:text-cyan-200 text-sm font-bold flex items-center gap-2 pr-4 border-r border-cyan-500/30"
                    >
                        <Maximize2 size={14} className="rotate-45" /> EXIT NEXUS
                    </button>
                    <div className="flex items-center gap-2">
                        <Search size={14} className="text-cyan-500" />
                        <input
                            className="bg-transparent border-none outline-none text-cyan-100 text-sm w-48 placeholder:text-cyan-800"
                            placeholder="Search neural link..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Graph Container */}
            <div className="flex-1 w-full h-full cursor-crosshair">
                {!loading && (
                    <ForceGraph2D
                        ref={graphRef}
                        graphData={filteredData}
                        nodeLabel="label"
                        nodeColor={node => {
                            // Hash string to color for consistent group colors
                            // or just use a cyan monochrome theme
                            return "#22d3ee";
                        }}
                        nodeRelSize={6}
                        linkColor={() => "rgba(34, 211, 238, 0.2)"}
                        backgroundColor="#000000"
                        onNodeClick={handleNodeClick}
                        nodeCanvasObject={(node: any, ctx, globalScale) => {
                            const label = node.label;
                            const fontSize = 12 / globalScale;
                            ctx.font = `${fontSize}px Sans-Serif`;
                            const textWidth = ctx.measureText(label).width;
                            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

                            // Draw Node
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                            ctx.fillStyle = node.group === "General" ? "#4b5563" : "#06b6d4"; // Cyan for course notes
                            ctx.fill();

                            // Glow effect
                            ctx.shadowBlur = 15;
                            ctx.shadowColor = "#06b6d4";

                            // Text
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                            if (globalScale > 1.5) { // Only show label when zoomed in a bit
                                ctx.fillText(label, node.x, node.y + 8);
                            }

                            ctx.shadowBlur = 0; // reset
                        }}
                    />
                )}
            </div>
        </div>
    );
}
