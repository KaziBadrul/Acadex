import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Acadex Workspace",
        short_name: "Acadex",
        description: "Minimal premium workspace for notes and scheduling.",
        start_url: "/",
        display: "standalone",
        background_color: "#F8F9FB",
        theme_color: "#4C6FFF",
        icons: [
            {
                src: "/acadexShortLogo.png",
                sizes: "any",
                type: "image/png",
            },
            {
                src: "/ACADEX.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
