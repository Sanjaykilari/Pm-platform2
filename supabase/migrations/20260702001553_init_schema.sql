-- Workspaces Table
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Workspace Members Table
CREATE TABLE workspace_members (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Member', 'Viewer')),
    PRIMARY KEY (workspace_id, user_id)
);

-- Portfolios Table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Planning', 'Completed')),
    budget_allocated DECIMAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Proposed' CHECK (status IN ('Proposed', 'Active', 'On Hold', 'Completed')),
    health TEXT NOT NULL DEFAULT 'Green' CHECK (health IN ('Green', 'Yellow', 'Red')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    budget DECIMAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sprints Table
CREATE TABLE sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'Planning' CHECK (status IN ('Planning', 'Active', 'Completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'In Review', 'Done')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ideas (Product Discovery) Table
CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    summary TEXT NOT NULL,
    theme TEXT,
    roadmap_status TEXT NOT NULL DEFAULT 'Later' CHECK (roadmap_status IN ('Now', 'Next', 'Later', 'Won''t do')),
    impact INTEGER CHECK (impact >= 1 AND impact <= 5),
    effort INTEGER CHECK (effort >= 1 AND effort <= 5),
    score DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Automations (Business Rules) Table
CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    trigger_entity TEXT NOT NULL CHECK (trigger_entity IN ('Task', 'Idea', 'Project')),
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('ON_CREATE', 'ON_UPDATE')),
    conditions JSONB,
    actions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

-- CREATE RLS POLICIES
-- Workspaces: Users can view their own workspaces
CREATE POLICY "View own workspaces" ON workspaces FOR SELECT USING (
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);

-- Members: Users can view members of their workspaces
CREATE POLICY "View workspace members" ON workspace_members FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);

-- Portfolios: Users can view, insert, update, delete in their workspaces
CREATE POLICY "Portfolio Access" ON portfolios FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);

-- Projects
CREATE POLICY "Project Access" ON projects FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);

-- Sprints
CREATE POLICY "Sprint Access" ON sprints FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);

-- Tasks
CREATE POLICY "Task Access" ON tasks FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);

-- Ideas
CREATE POLICY "Idea Access" ON ideas FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);

-- Automations
CREATE POLICY "Automation Access" ON automations FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);
