// app/api/comments/resource/[id]/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/comments/resource/[id] - Fetch all comments for a resource
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await context.params;
        const resourceId = parseInt(id, 10);

        if (isNaN(resourceId)) {
            return NextResponse.json(
                { error: "Invalid resource ID" },
                { status: 400 }
            );
        }

        // Fetch comments with user profile information
        const { data: comments, error } = await supabase
            .from("comments")
            .select(
                `
        id,
        content,
        created_at,
        user_id,
        profiles:user_id (
          username
        )
      `
            )
            .eq("resource_id", resourceId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching comments:", error);
            return NextResponse.json(
                { error: "Failed to fetch comments" },
                { status: 500 }
            );
        }

        return NextResponse.json({ comments }, { status: 200 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/comments/resource/[id] - Create a new comment on a resource
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await context.params;
        const resourceId = parseInt(id, 10);

        if (isNaN(resourceId)) {
            return NextResponse.json(
                { error: "Invalid resource ID" },
                { status: 400 }
            );
        }

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse request body
        const body = await request.json();
        const { content } = body;

        if (!content || typeof content !== "string" || content.trim() === "") {
            return NextResponse.json(
                { error: "Comment content is required" },
                { status: 400 }
            );
        }

        // Verify resource exists
        const { data: resource, error: resourceError } = await supabase
            .from("resources")
            .select("id")
            .eq("id", resourceId)
            .single();

        if (resourceError || !resource) {
            return NextResponse.json(
                { error: "Resource not found" },
                { status: 404 }
            );
        }

        // Create comment
        const { data: comment, error: insertError } = await supabase
            .from("comments")
            .insert({
                content: content.trim(),
                resource_id: resourceId,
                user_id: user.id,
            })
            .select(
                `
        id,
        content,
        created_at,
        user_id,
        profiles:user_id (
          username
        )
      `
            )
            .single();

        if (insertError) {
            console.error("Error creating comment:", insertError);
            return NextResponse.json(
                { error: "Failed to create comment" },
                { status: 500 }
            );
        }

        return NextResponse.json({ comment }, { status: 201 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
