import { expect, it, vi } from "vitest";

// Exercise the handler's persistence/error decisions, separate from the
// framework transport and real RLS checks (which need configured Supabase).
vi.mock("@/lib/telemetry.server", () => ({ recordAudit: vi.fn(async () => undefined) }));

import { updateActionState } from "@/lib/action-execution.server";

function client(nodeType: string, actionError: string | null = null) {
    const writes: string[] = [];
    return {
        writes,
        from: (table: string) => {
            const query = {
                select: () => query,
                eq: () => query,
                update: () => {
                    writes.push(table);
                    return query;
                },
                maybeSingle: async () => ({
                    data: { id: "node", title: "Work", node_type: nodeType },
                    error: null,
                }),
                then: (resolve: (value: unknown) => unknown) =>
                    Promise.resolve(
                        resolve({
                            data: null,
                            error:
                                table === "actions" && actionError
                                    ? { message: actionError }
                                    : null,
                        }),
                    ),
            };
            return query;
        },
    };
}

const invoke = (args: {
    data: { nodeId: string; status: "DONE" };
    context: { supabase: ReturnType<typeof client>; userId: string };
}) =>
    updateActionState(
        args.data,
        args.context as unknown as Parameters<typeof updateActionState>[1],
    );

it("does not report successful completion when action metadata cannot be saved", async () => {
    const supabase = client("ACTION", "Connection interrupted");
    await expect(
        invoke({
            data: { nodeId: "node", status: "DONE" },
            context: { supabase, userId: "owner" },
        }),
    ).rejects.toThrow("Action details could not be saved");
    expect(supabase.writes).not.toContain("plan_nodes");
});

it("supports milestone completion without requiring an action record", async () => {
    const supabase = client("MILESTONE");
    await expect(
        invoke({
            data: { nodeId: "node", status: "DONE" },
            context: { supabase, userId: "owner" },
        }),
    ).resolves.toEqual({ ok: true });
    expect(supabase.writes).toContain("plan_nodes");
});

it("rejects status updates to a non-executable objective", async () => {
    const supabase = client("OBJECTIVE");
    await expect(
        invoke({
            data: { nodeId: "node", status: "DONE" },
            context: { supabase, userId: "owner" },
        }),
    ).rejects.toThrow("Only actions, experiments, and milestones");
    expect(supabase.writes).toEqual([]);
});
