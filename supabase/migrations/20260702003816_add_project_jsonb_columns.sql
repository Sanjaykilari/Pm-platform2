-- Add JSONB array columns to projects table to support RAID logs, Financials, and Workplan data
ALTER TABLE projects
  ADD COLUMN assumptions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN issues JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN dependencies JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN risks JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN capex_items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN action_items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN decisions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN requirements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN targets JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN discussions JSONB DEFAULT '[]'::jsonb;
