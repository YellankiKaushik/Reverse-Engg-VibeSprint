import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export interface ActionUpdateInput {
    nodeId: string;
    status: "PENDING" | "IN_PROGRESS" | "DONE" | "BLOCKED" | "SKIPPED" | "DEFERRED";
    note?: string | undefined;
    dueAt?: string | null | undefined;
}

/** Authenticated execution logic; the caller supplies its owner-scoped client. */
export async function updateActionState(
    data: ActionUpdateInput,
    context: { supabase: SupabaseClient<Database>; userId: string },
) {
    const { supabase, userId } = context;

    const node = await supabase
        .from("plan_nodes")
        .select("id, title, node_type")
        .eq("id", data.nodeId)
        .eq("user_id", userId)
        .maybeSingle();
    if (node.error) throw new Error(`That action could not be loaded: ${node.error.message}`);
    if (!node.data) throw new Error("That action could not be found.");
    if (!["ACTION", "EXPERIMENT", "MILESTONE"].includes(node.data.node_type)) {
        throw new Error("Only actions, experiments, and milestones can be marked complete.");
    }

    const actionPatch: {
        completed_at: string | null;
        result?: { note: string } | null;
        due_at?: string | null;
    } = {
        completed_at: data.status === "DONE" ? new Date().toISOString() : null,
    };
    if (data.note !== undefined) actionPatch.result = data.note ? { note: data.note } : null;
    if (data.dueAt !== undefined) actionPatch.due_at = data.dueAt;

    const actionUpdate = await supabase
        .from("actions")
        .update(actionPatch as never)
        .eq("plan_node_id", data.nodeId)
        .eq("user_id", userId);
    if (actionUpdate.error)
        throw new Error(`Action details could not be saved: ${actionUpdate.error.message}`);

    const { error } = await supabase
        .from("plan_nodes")
        .update({ status: data.status })
        .eq("id", data.nodeId)
        .eq("user_id", userId);
    if (error) throw new Error(error.message);

    const telemetry = await import("@/lib/telemetry.server");
    await telemetry.recordAudit({
        userId,
        action: `ACTION_${data.status}`,
        resource: "plan_nodes",
        resourceId: data.nodeId,
    });

    return { ok: true };
}
