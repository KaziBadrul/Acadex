// app/api/comments/[id]/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/comments/[id] - Update a comment
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        const commentId = parseInt(params.id, 10);

        if (isNaN(commentId)) {
            return NextResponse.json(
                { error: "Invalid comment ID" },
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

        // Verify comment exists and user owns it
        const { data: existingComment, error: fetchError } = await supabase
            .from("comments")
            .select("user_id")
            .eq("id", commentId)
            .single();

        if (fetchError || !existingComment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 }
            );
        }

        if (existingComment.user_id !== user.id) {
            return NextResponse.json(
                { error: "You can only edit your own comments" },
                { status: 403 }
            );
        }

        // Update comment
        const { data: comment, error: updateError } = await supabase
            .from("comments")
            .update({ content: content.trim() })
            .eq("id", commentId)
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

        if (updateError) {
            console.error("Error updating comment:", updateError);
            return NextResponse.json(
                { error: "Failed to update comment" },
                { status: 500 }
            );
        }

        return NextResponse.json({ comment }, { status: 200 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        const commentId = parseInt(params.id, 10);

        if (isNaN(commentId)) {
            return NextResponse.json(
                { error: "Invalid comment ID" },
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

        // Verify comment exists and user owns it
        const { data: existingComment, error: fetchError } = await supabase
            .from("comments")
            .select("user_id")
            .eq("id", commentId)
            .single();

        if (fetchError || !existingComment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 }
            );
        }

        if (existingComment.user_id !== user.id) {
            return NextResponse.json(
                { error: "You can only delete your own comments" },
                { status: 403 }
            );
        }

        // Delete comment
        const { error: deleteError } = await supabase
            .from("comments")
            .delete()
            .eq("id", commentId);

        if (deleteError) {
            console.error("Error deleting comment:", deleteError);
            return NextResponse.json(
                { error: "Failed to delete comment" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Comment deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
