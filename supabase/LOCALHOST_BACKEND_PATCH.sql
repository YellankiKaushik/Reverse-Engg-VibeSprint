-- REVIEWED PATCH: Reverse Engineering / usvopldwiwzlvoqawvcu only.
-- Contains only four existing unapplied migrations. No table/data reset.
-- Approve before executing in the verified project.
BEGIN;

-- SOURCE: 20261011095115_restrict_internal_ownership_helpers.sql
-- Internal trigger helpers are not application RPC endpoints.
-- Existing triggers continue to execute under their established privileges.
ALTER FUNCTION public.require_same_owner(uuid, uuid, text) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.require_same_owner(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_case_context_fact_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_plan_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_plan_version_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_strategy_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_plan_node_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_plan_edge_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_assumption_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_risk_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_action_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_check_in_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_plan_change_owner() FROM PUBLIC, anon, authenticated;


-- SOURCE: 20261013084557_atomic_execution_updates.sql
-- Owner-scoped transactional action completion and editing. Existing data is preserved.
CREATE OR REPLACE FUNCTION public.update_execution_node(target_node_id uuid, patch jsonb)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  target public.plan_nodes%ROWTYPE;
  target_version_id uuid;
  next_status public.node_status;
BEGIN
  SELECT plan_version_id INTO target_version_id FROM public.plan_nodes
  WHERE id = target_node_id AND user_id = auth.uid();
  IF target_version_id IS NULL THEN
    RAISE EXCEPTION 'That action could not be found.' USING ERRCODE = '42501';
  END IF;
  -- Serialize mutations across this graph so prerequisite checks cannot race.
  PERFORM id FROM public.plan_versions WHERE id = target_version_id FOR UPDATE;
  SELECT * INTO target FROM public.plan_nodes
  WHERE id = target_node_id AND user_id = auth.uid() FOR UPDATE;
  IF target.node_type NOT IN ('ACTION', 'EXPERIMENT', 'MILESTONE') THEN
    RAISE EXCEPTION 'Only actions, experiments, and milestones can be updated.';
  END IF;
  IF patch ? 'status' THEN
    next_status := (patch->>'status')::public.node_status;
    IF next_status IS NULL OR next_status NOT IN ('PENDING','IN_PROGRESS','DONE','BLOCKED','SKIPPED','DEFERRED') THEN
      RAISE EXCEPTION 'Invalid action status.';
    END IF;
    IF next_status IN ('DONE', 'IN_PROGRESS') AND EXISTS (
      SELECT 1 FROM public.plan_edges e JOIN public.plan_nodes prerequisite
        ON prerequisite.id = CASE WHEN e.edge_type = 'BLOCKED_BY' THEN e.to_node_id ELSE e.from_node_id END
      WHERE e.plan_version_id = target.plan_version_id AND e.hard_dependency
        AND e.edge_type IN ('REQUIRES','PRECEDES','BLOCKED_BY')
        AND CASE WHEN e.edge_type = 'BLOCKED_BY' THEN e.from_node_id ELSE e.to_node_id END = target.id
        AND prerequisite.status <> 'DONE'
    ) THEN
      RAISE EXCEPTION 'Complete the prerequisites before starting or completing this action.';
    END IF;
  END IF;
  IF patch ? 'title' AND (target.node_type = 'MILESTONE' OR length(patch->>'title') NOT BETWEEN 2 AND 160) THEN
    RAISE EXCEPTION 'Invalid action edit.';
  END IF;
  IF length(coalesce(patch->>'note', '')) > 1200 OR length(coalesce(patch->>'description', '')) > 800
     OR length(coalesce(patch->>'completionCriteria', '')) > 400 THEN
    RAISE EXCEPTION 'Action text is too long.';
  END IF;
  IF patch ? 'estimatedMinutes' AND (patch->>'estimatedMinutes')::integer NOT BETWEEN 1 AND 100000 THEN
    RAISE EXCEPTION 'Invalid effort estimate.';
  END IF;
  IF target.node_type <> 'MILESTONE' THEN
    UPDATE public.actions SET
      completed_at = CASE WHEN patch ? 'status' THEN
        CASE WHEN next_status = 'DONE' THEN coalesce(completed_at, now()) ELSE NULL END ELSE completed_at END,
      result = CASE WHEN patch ? 'note' THEN CASE WHEN coalesce(patch->>'note','') = '' THEN NULL ELSE jsonb_build_object('note', patch->>'note') END ELSE result END,
      due_at = CASE WHEN patch ? 'dueAt' THEN (patch->>'dueAt')::timestamptz ELSE due_at END,
      completion_criteria = CASE WHEN patch ? 'completionCriteria' THEN patch->>'completionCriteria' ELSE completion_criteria END,
      estimated_minutes = CASE WHEN patch ? 'estimatedMinutes' THEN (patch->>'estimatedMinutes')::integer ELSE estimated_minutes END,
      revision = revision + CASE WHEN patch ? 'title' THEN 1 ELSE 0 END
    WHERE plan_node_id = target.id AND user_id = auth.uid();
    IF NOT FOUND THEN RAISE EXCEPTION 'Action details could not be found.'; END IF;
  END IF;
  UPDATE public.plan_nodes SET
    status = coalesce(next_status, status),
    title = CASE WHEN patch ? 'title' THEN patch->>'title' ELSE title END,
    description = CASE WHEN patch ? 'description' THEN patch->>'description' ELSE description END
  WHERE id = target.id AND user_id = auth.uid();
END;
$$;
REVOKE ALL ON FUNCTION public.update_execution_node(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_execution_node(uuid, jsonb) TO authenticated;


-- SOURCE: 20261013085758_atomic_plan_persistence.sql
-- Graph rows and activation commit together. No existing rows are deleted.
CREATE OR REPLACE FUNCTION public.persist_plan_graph(target_plan_id uuid, payload jsonb, activate boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  version_id uuid := gen_random_uuid();
  version_number integer;
  owner_id uuid := auth.uid();
  case_id uuid;
  row_data jsonb;
  defaults jsonb;
  table_name text;
BEGIN
  SELECT p.case_id INTO case_id FROM public.plans p
  WHERE p.id = target_plan_id AND p.user_id = owner_id FOR UPDATE;
  IF case_id IS NULL THEN RAISE EXCEPTION 'That plan could not be found.' USING ERRCODE = '42501'; END IF;
  SELECT coalesce(max(v.version_number), 0) + 1 INTO version_number
  FROM public.plan_versions v WHERE v.plan_id = target_plan_id;
  row_data := payload->'version' || jsonb_build_object(
    'id', version_id, 'user_id', owner_id, 'plan_id', target_plan_id,
    'version_number', version_number, 'state', 'CANDIDATE',
    'bottleneck_node_id', NULL, 'created_at', now(), 'updated_at', now());
  INSERT INTO public.plan_versions SELECT (jsonb_populate_record(NULL::public.plan_versions, row_data)).*;
  -- The table list is constant, not caller-controlled. Every row remains under RLS.
  FOREACH table_name IN ARRAY ARRAY['strategies','plan_nodes','plan_edges','actions','assumptions','risks'] LOOP
    defaults := CASE table_name
      WHEN 'strategies' THEN '{"summary":"","risk_level":"MEDIUM","selected":false,"rationale":"","tradeoffs":[]}'::jsonb
      WHEN 'plan_nodes' THEN '{"description":"","status":"PENDING","depth":0,"metadata":{}}'::jsonb
      WHEN 'plan_edges' THEN '{"hard_dependency":true}'::jsonb
      WHEN 'actions' THEN '{"completion_criteria":"","revision":1}'::jsonb
      WHEN 'assumptions' THEN '{"importance":"MEDIUM","status":"UNVALIDATED"}'::jsonb
      ELSE '{"probability_band":"MEDIUM","impact_band":"MEDIUM","mitigation":"","status":"OPEN"}'::jsonb END;
    FOR row_data IN SELECT value FROM jsonb_array_elements(coalesce(payload->table_name, '[]'::jsonb)) LOOP
      row_data := defaults || row_data || jsonb_build_object(
        'id', coalesce((row_data->>'id')::uuid, gen_random_uuid()),
        'user_id', owner_id, 'plan_version_id', version_id,
        'created_at', now(), 'updated_at', now());
      IF table_name = 'actions' AND NOT EXISTS (
        SELECT 1 FROM public.plan_nodes WHERE id = (row_data->>'plan_node_id')::uuid AND plan_version_id = version_id
      ) THEN RAISE EXCEPTION 'Action must belong to the new graph.'; END IF;
      EXECUTE format('INSERT INTO public.%I SELECT (jsonb_populate_record(NULL::public.%I, $1)).*', table_name, table_name) USING row_data;
    END LOOP;
  END LOOP;
  UPDATE public.plan_versions SET bottleneck_node_id = (payload->>'bottleneckId')::uuid,
    bottleneck_reason = payload->>'bottleneckReason' WHERE id = version_id;
  IF activate THEN
    PERFORM public.activate_plan_version_for_user(target_plan_id, version_id);
    UPDATE public.intake_cases SET status = 'PLANNED' WHERE id = case_id AND user_id = owner_id;
  END IF;
  RETURN jsonb_build_object('versionId', version_id, 'versionNumber', version_number);
END;
$$;
REVOKE ALL ON FUNCTION public.persist_plan_graph(uuid, jsonb, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.persist_plan_graph(uuid, jsonb, boolean) TO authenticated;

-- Activation needs only owner-scoped privileges, and concurrent activation locks the plan.
CREATE OR REPLACE FUNCTION public.activate_plan_version_for_user(target_plan_id uuid, target_version_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE target_state public.version_state;
BEGIN
  PERFORM id FROM public.plans WHERE id = target_plan_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'plan version not found' USING ERRCODE = '42501'; END IF;
  SELECT state INTO target_state FROM public.plan_versions
  WHERE id = target_version_id AND plan_id = target_plan_id AND user_id = auth.uid() FOR UPDATE;
  IF target_state IS NULL THEN RAISE EXCEPTION 'plan version not found' USING ERRCODE = '42501'; END IF;
  IF target_state = 'REJECTED' THEN RAISE EXCEPTION 'rejected plan versions cannot be activated' USING ERRCODE = '23514'; END IF;
  UPDATE public.plan_versions SET state = 'SUPERSEDED' WHERE plan_id = target_plan_id AND user_id = auth.uid() AND state = 'ACTIVE' AND id <> target_version_id;
  UPDATE public.plan_versions SET state = 'ACTIVE' WHERE id = target_version_id AND user_id = auth.uid();
  UPDATE public.plans SET active_version_id = target_version_id WHERE id = target_plan_id AND user_id = auth.uid();
END;
$$;


-- SOURCE: 20261013090748_atomic_checkins_and_strategy_selection.sql
CREATE OR REPLACE FUNCTION public.select_plan_strategy(target_version_id uuid, target_strategy_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  PERFORM id FROM public.plan_versions WHERE id = target_version_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND OR NOT EXISTS (SELECT 1 FROM public.strategies WHERE id = target_strategy_id AND plan_version_id = target_version_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'That strategy does not belong to this plan version.' USING ERRCODE = '42501';
  END IF;
  UPDATE public.strategies SET selected = (id = target_strategy_id)
  WHERE plan_version_id = target_version_id AND user_id = auth.uid();
END;
$$;
REVOKE ALL ON FUNCTION public.select_plan_strategy(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.select_plan_strategy(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.save_plan_check_in(target_plan_id uuid, note text, progress_rating integer, changed_facts jsonb)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE case_id uuid; fact jsonb;
BEGIN
  SELECT p.case_id INTO case_id FROM public.plans p WHERE p.id = target_plan_id AND p.user_id = auth.uid() FOR UPDATE;
  IF case_id IS NULL THEN RAISE EXCEPTION 'That plan could not be found.' USING ERRCODE = '42501'; END IF;
  IF length(note) > 2000 OR progress_rating NOT BETWEEN 1 AND 5 OR jsonb_array_length(changed_facts) > 10 THEN
    RAISE EXCEPTION 'Invalid check-in.';
  END IF;
  INSERT INTO public.check_ins (user_id, plan_id, note, progress_rating, changed_facts)
  VALUES (auth.uid(), target_plan_id, nullif(note, ''), progress_rating, changed_facts);
  FOR fact IN SELECT value FROM jsonb_array_elements(changed_facts) LOOP
    IF length(fact->>'key') NOT BETWEEN 1 AND 80 OR length(fact->>'value') NOT BETWEEN 1 AND 600 THEN
      RAISE EXCEPTION 'Invalid changed fact.';
    END IF;
    INSERT INTO public.case_context_facts (user_id, case_id, category, key, value, source, confidence)
    VALUES (auth.uid(), case_id, (fact->>'category')::public.fact_category, fact->>'key', jsonb_build_object('answer', fact->>'value'), 'CHECK_IN', 1);
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.save_plan_check_in(uuid, text, integer, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_plan_check_in(uuid, text, integer, jsonb) TO authenticated;


NOTIFY pgrst, 'reload schema';
COMMIT;
