.headers on
.mode duckbox
.maxrows 80
.maxwidth 160
.timer on

.print '== databases =='
.databases

.print '== tables =='
.tables

.print '== graph object schema =='
DESCRIBE speckle_graph_objects;

.print '== graph edge schema =='
DESCRIBE speckle_graph_edges;

.print '== graph property schema =='
DESCRIBE speckle_graph_properties;

.print '== graph proxy schema =='
DESCRIBE speckle_graph_proxy_memberships;

.print '== graph counts =='
SELECT graph_id, count(*) AS objects
FROM speckle_graph_objects
GROUP BY graph_id
ORDER BY graph_id;

.print '== object type inventory =='
SELECT coalesce(speckle_type, '<missing>') AS speckle_type, count(*) AS count
FROM speckle_graph_objects
GROUP BY speckle_type
ORDER BY count DESC
LIMIT 40;

.print '== common property keys =='
SELECT coalesce(key_norm, '<missing>') AS key_norm, count(*) AS count
FROM speckle_graph_properties
GROUP BY key_norm
ORDER BY count DESC
LIMIT 80;

.print '== edge kind counts =='
SELECT edge_kind, count(*) AS count
FROM speckle_graph_edges
GROUP BY edge_kind
ORDER BY count DESC;

.print '== proxy membership counts =='
SELECT proxy_type, coalesce(proxy_name, '<unnamed>') AS proxy_name, count(*) AS objects
FROM speckle_graph_proxy_memberships
GROUP BY proxy_type, proxy_name
ORDER BY objects DESC
LIMIT 80;

.print '== displayable objects sample =='
SELECT graph_id, object_id, application_id, name, speckle_type
FROM speckle_graph_objects
WHERE has_display_value = true
ORDER BY graph_id, name NULLS LAST
LIMIT 80;

.print '== category property sample =='
SELECT o.graph_id, o.object_id, o.name, p.value_text AS category
FROM speckle_graph_objects o
JOIN speckle_graph_properties p USING (graph_id, object_id)
WHERE p.key_norm = 'category'
ORDER BY o.graph_id, category, o.name NULLS LAST
LIMIT 80;

.print '== level proxy sample =='
SELECT o.graph_id, o.object_id, o.name, m.proxy_name AS level
FROM speckle_graph_proxy_memberships m
JOIN speckle_graph_objects o
  ON o.graph_id = m.graph_id
 AND o.object_id = m.target_object_id
WHERE lower(m.proxy_type) LIKE '%level%'
ORDER BY o.graph_id, level, o.name NULLS LAST
LIMIT 80;

.print '== raw object json sample =='
SELECT
  object_id,
  object_json->>'$.name' AS json_name,
  object_json->>'$.properties.category' AS json_category,
  speckle_type
FROM speckle_graph_objects
LIMIT 20;
