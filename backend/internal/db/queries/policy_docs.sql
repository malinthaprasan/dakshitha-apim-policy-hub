-- name: GetPolicyDoc :one
SELECT * FROM policy_docs
WHERE policy_version_id = $1 AND page = $2;

-- name: ListPolicyDocs :many
SELECT * FROM policy_docs
WHERE policy_version_id = $1
ORDER BY page;

-- name: UpsertPolicyDoc :one
INSERT INTO policy_docs (
    policy_version_id,
    page,
    content_md,
    created_at,
    updated_at
) VALUES (
    $1, $2, $3, NOW(), NOW()
)
ON CONFLICT (policy_version_id, page)
DO UPDATE SET
    content_md = EXCLUDED.content_md,
    updated_at = NOW()
RETURNING *;
