-- ============================================================
-- Hammertime — Construction Business Management
-- Supabase PostgreSQL Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('admin', 'sales', 'office_staff');

create type customer_status as enum ('lead', 'active', 'inactive');

create type project_type as enum (
  'metal_building',
  'wood_building',
  'fence',
  'gate',
  'patio_cover',
  'patio_extension',
  'other'
);

create type project_status as enum (
  'lead',
  'estimating',
  'proposal_sent',
  'approved',
  'in_progress',
  'completed',
  'cancelled'
);

create type scope_section_type as enum (
  'concrete_slab',
  'driveway',
  'building_installation',
  'electrical',
  'plumbing',
  'insulation',
  'barn_doors',
  'mezzanine',
  'included_items',
  'not_included',
  'framing',
  'roofing',
  'doors_windows',
  'fencing',
  'gates',
  'patio_structure',
  'notes',
  'custom'
);

create type document_status as enum ('draft', 'sent', 'viewed', 'signed', 'expired');

create type activity_action as enum (
  'created',
  'updated',
  'deleted',
  'status_changed',
  'document_sent',
  'document_signed',
  'note_added'
);

create type contact_method as enum ('phone', 'email', 'text');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  role         user_role not null default 'sales',
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table profiles is 'App users with roles, linked to Supabase Auth';

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'sales'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- CUSTOMERS
-- ============================================================

create table customers (
  id                        uuid primary key default uuid_generate_v4(),
  first_name                text not null,
  last_name                 text not null,
  company                   text,
  email                     text,
  email_secondary           text,
  phone                     text,
  phone_secondary           text,
  preferred_contact         contact_method not null default 'phone',
  address_line1             text,
  address_line2             text,
  city                      text,
  state                     char(2),
  zip                       text,
  mailing_same_as_address   boolean not null default true,
  mailing_address_line1     text,
  mailing_address_line2     text,
  mailing_city              text,
  mailing_state             char(2),
  mailing_zip               text,
  notes                     text,
  status                    customer_status not null default 'lead',
  created_by                uuid references profiles(id) on delete set null,
  last_activity_at          timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index idx_customers_status on customers(status);
create index idx_customers_last_name on customers(last_name);
create index idx_customers_created_by on customers(created_by);
create index idx_customers_full_name on customers using gin(to_tsvector('english', first_name || ' ' || last_name));

comment on table customers is 'Residential construction customers';

-- ============================================================
-- PROJECTS
-- ============================================================

create table projects (
  id                 uuid primary key default uuid_generate_v4(),
  customer_id        uuid not null references customers(id) on delete cascade,
  name               text not null,
  type               project_type not null,
  status             project_status not null default 'lead',
  location_address   text,
  description        text,
  internal_notes     text,
  customer_notes     text,
  salesperson_id     uuid references profiles(id) on delete set null,
  start_date         date,
  completion_date    date,
  subtotal           numeric(12,2) not null default 0,
  tax_rate           numeric(5,2) not null default 0,
  tax_amount         numeric(12,2) not null default 0,
  discount_amount    numeric(12,2) not null default 0,
  total              numeric(12,2) not null default 0,
  created_by         uuid references profiles(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint positive_totals check (subtotal >= 0 and total >= 0)
);

create index idx_projects_customer_id on projects(customer_id);
create index idx_projects_status on projects(status);
create index idx_projects_type on projects(type);
create index idx_projects_salesperson on projects(salesperson_id);
create index idx_projects_updated_at on projects(updated_at desc);

comment on table projects is 'Construction projects linked to customers';

-- ============================================================
-- SCOPE SECTIONS
-- ============================================================

create table scope_sections (
  id             uuid primary key default uuid_generate_v4(),
  project_id     uuid not null references projects(id) on delete cascade,
  title          text not null,
  section_type   scope_section_type not null default 'custom',
  description    text,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_scope_sections_project_id on scope_sections(project_id, sort_order);

comment on table scope_sections is 'Structured scope-of-work sections per project (concrete, framing, electrical, etc.)';

-- ============================================================
-- LINE ITEMS
-- ============================================================

create table line_items (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references projects(id) on delete cascade,
  name            text not null,
  description     text,
  quantity        numeric(10,4) not null default 1,
  unit            text not null default 'ls',
  unit_price      numeric(12,2) not null default 0,
  markup_percent  numeric(5,2) not null default 0,
  taxable         boolean not null default false,
  sort_order      int not null default 0,
  total           numeric(12,2) not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint positive_quantity check (quantity > 0),
  constraint positive_price check (unit_price >= 0)
);

create index idx_line_items_project_id on line_items(project_id, sort_order);

comment on table line_items is 'Itemized pricing for a project';

-- ============================================================
-- PAYMENT SCHEDULE ITEMS
-- ============================================================

create table payment_schedule_items (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references projects(id) on delete cascade,
  label        text not null,
  amount       numeric(12,2) not null,
  due_trigger  text not null,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint positive_amount check (amount >= 0)
);

create index idx_payment_schedule_project_id on payment_schedule_items(project_id, sort_order);

comment on table payment_schedule_items is 'Draw schedule — Acceptance, Framing, Sheet & Trim, Final, etc.';

-- ============================================================
-- PROPOSALS
-- ============================================================

create table proposals (
  id               uuid primary key default uuid_generate_v4(),
  project_id       uuid not null references projects(id) on delete cascade,
  version_number   int not null default 1,
  title            text not null,
  status           document_status not null default 'draft',
  valid_until      date,
  notes            text,
  snapshot_json    jsonb not null default '{}',
  storage_path     text,
  sent_at          timestamptz,
  created_by       uuid references profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (project_id, version_number)
);

create index idx_proposals_project_id on proposals(project_id);
create index idx_proposals_status on proposals(status);

comment on table proposals is 'Versioned proposal documents. snapshot_json freezes project state at generation.';

-- ============================================================
-- CONTRACTS
-- ============================================================

create table contracts (
  id               uuid primary key default uuid_generate_v4(),
  project_id       uuid not null references projects(id) on delete cascade,
  proposal_id      uuid references proposals(id) on delete set null,
  version_number   int not null default 1,
  title            text not null,
  status           document_status not null default 'draft',
  terms            text,
  warranty_terms   text,
  snapshot_json    jsonb not null default '{}',
  storage_path     text,
  sent_at          timestamptz,
  signed_at        timestamptz,
  created_by       uuid references profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (project_id, version_number)
);

create index idx_contracts_project_id on contracts(project_id);
create index idx_contracts_status on contracts(status);

comment on table contracts is 'Versioned contract documents with legal terms and warranty sections.';

-- ============================================================
-- TEMPLATE CLAUSES
-- ============================================================

create table template_clauses (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  category     text not null,
  body         text not null,
  version      int not null default 1,
  is_active    boolean not null default true,
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_template_clauses_category on template_clauses(category, is_active);

comment on table template_clauses is 'Reusable legal/scheduling clause library for proposals and contracts';

-- Seed standard clauses
insert into template_clauses (title, category, body) values
  ('Scheduling Delays', 'scheduling', 'Company shall not be held liable for delays caused by weather, material shortages, subcontractor delays, or other circumstances beyond our reasonable control. Customer will be notified of delays as soon as practicable.'),
  ('Material Price Validity', 'pricing', 'Pricing in this proposal is valid for 30 days from the date of issue. Material prices are subject to change without notice beyond this period.'),
  ('Change Order Requirement', 'scope', 'Any changes to the scope of work described herein must be documented in a written Change Order signed by both parties prior to the commencement of changed work. Verbal agreements are not binding.'),
  ('Credit Card Fee', 'payment', 'A 3% convenience fee will be added to all payments made by credit card. Payments by check, ACH, or wire transfer are accepted at no additional charge.'),
  ('Customer Site Access', 'customer_responsibility', 'Customer is responsible for providing Company with reasonable access to the job site during normal business hours. Customer shall ensure utilities are available and the site is clear of obstructions prior to scheduled work.'),
  ('Warranty', 'warranty', 'Company warrants all workmanship for a period of one (1) year from substantial completion. Manufacturer warranties on materials and equipment are passed through to the customer. This warranty does not cover damage due to misuse, neglect, or acts of nature.');

-- ============================================================
-- DOCUMENT VERSIONS
-- ============================================================

create table document_versions (
  id               uuid primary key default uuid_generate_v4(),
  entity_type      text not null check (entity_type in ('proposal', 'contract')),
  entity_id        uuid not null,
  version_number   int not null,
  revision_label   text,
  revision_notes   text,
  snapshot_json    jsonb not null,
  storage_path     text,
  created_by       uuid references profiles(id) on delete set null,
  created_at       timestamptz not null default now()
  -- intentionally no updated_at: versions are immutable
);

create index idx_document_versions_entity on document_versions(entity_type, entity_id);

comment on table document_versions is 'Immutable version history for proposals and contracts. Never updated after insert.';

-- ============================================================
-- ACTIVITY LOG
-- ============================================================

create table activity_logs (
  id            uuid primary key default uuid_generate_v4(),
  entity_type   text not null,
  entity_id     uuid not null,
  action        activity_action not null,
  actor_id      uuid references profiles(id) on delete set null,
  description   text not null,
  metadata      jsonb,
  created_at    timestamptz not null default now()
  -- intentionally no updated_at: log entries are immutable
);

create index idx_activity_logs_entity on activity_logs(entity_type, entity_id, created_at desc);
create index idx_activity_logs_actor on activity_logs(actor_id);
create index idx_activity_logs_created_at on activity_logs(created_at desc);

comment on table activity_logs is 'Immutable audit trail for all significant actions';

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all mutable tables
create trigger trg_profiles_updated_at before update on profiles for each row execute function set_updated_at();
create trigger trg_customers_updated_at before update on customers for each row execute function set_updated_at();
create trigger trg_projects_updated_at before update on projects for each row execute function set_updated_at();
create trigger trg_scope_sections_updated_at before update on scope_sections for each row execute function set_updated_at();
create trigger trg_line_items_updated_at before update on line_items for each row execute function set_updated_at();
create trigger trg_payment_schedule_updated_at before update on payment_schedule_items for each row execute function set_updated_at();
create trigger trg_proposals_updated_at before update on proposals for each row execute function set_updated_at();
create trigger trg_contracts_updated_at before update on contracts for each row execute function set_updated_at();
create trigger trg_template_clauses_updated_at before update on template_clauses for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table customers enable row level security;
alter table projects enable row level security;
alter table scope_sections enable row level security;
alter table line_items enable row level security;
alter table payment_schedule_items enable row level security;
alter table proposals enable row level security;
alter table contracts enable row level security;
alter table template_clauses enable row level security;
alter table document_versions enable row level security;
alter table activity_logs enable row level security;

-- Helper: current user role
create or replace function current_user_role()
returns user_role as $$
  select role from profiles where id = auth.uid()
$$ language sql security definer stable;

-- ── PROFILES ─────────────────────────────────────────────────

-- Users can read their own profile; admins can read all
create policy "profiles: self or admin read"
  on profiles for select
  using (id = auth.uid() or current_user_role() = 'admin');

-- Users can update their own profile
create policy "profiles: self update"
  on profiles for update
  using (id = auth.uid());

-- ── CUSTOMERS ────────────────────────────────────────────────

create policy "customers: authenticated read"
  on customers for select
  using (auth.role() = 'authenticated');

create policy "customers: admin and sales insert"
  on customers for insert
  with check (current_user_role() in ('admin', 'sales'));

create policy "customers: admin and sales update"
  on customers for update
  using (current_user_role() in ('admin', 'sales'));

create policy "customers: admin delete"
  on customers for delete
  using (current_user_role() = 'admin');

-- ── PROJECTS ─────────────────────────────────────────────────

create policy "projects: authenticated read"
  on projects for select
  using (auth.role() = 'authenticated');

create policy "projects: admin and sales insert"
  on projects for insert
  with check (current_user_role() in ('admin', 'sales'));

create policy "projects: admin and sales update"
  on projects for update
  using (current_user_role() in ('admin', 'sales'));

create policy "projects: admin delete"
  on projects for delete
  using (current_user_role() = 'admin');

-- ── SCOPE SECTIONS ───────────────────────────────────────────

create policy "scope_sections: authenticated read"
  on scope_sections for select using (auth.role() = 'authenticated');

create policy "scope_sections: admin and sales write"
  on scope_sections for insert with check (current_user_role() in ('admin', 'sales'));

create policy "scope_sections: admin and sales update"
  on scope_sections for update using (current_user_role() in ('admin', 'sales'));

create policy "scope_sections: admin delete"
  on scope_sections for delete using (current_user_role() = 'admin');

-- ── LINE ITEMS ───────────────────────────────────────────────

create policy "line_items: authenticated read"
  on line_items for select using (auth.role() = 'authenticated');

create policy "line_items: admin and sales write"
  on line_items for insert with check (current_user_role() in ('admin', 'sales'));

create policy "line_items: admin and sales update"
  on line_items for update using (current_user_role() in ('admin', 'sales'));

create policy "line_items: admin delete"
  on line_items for delete using (current_user_role() = 'admin');

-- ── PAYMENT SCHEDULE ITEMS ───────────────────────────────────

create policy "payment_schedule: authenticated read"
  on payment_schedule_items for select using (auth.role() = 'authenticated');

create policy "payment_schedule: admin and sales write"
  on payment_schedule_items for insert with check (current_user_role() in ('admin', 'sales'));

create policy "payment_schedule: admin and sales update"
  on payment_schedule_items for update using (current_user_role() in ('admin', 'sales'));

create policy "payment_schedule: admin delete"
  on payment_schedule_items for delete using (current_user_role() in ('admin', 'sales'));

-- ── PROPOSALS & CONTRACTS ────────────────────────────────────

create policy "proposals: authenticated read"
  on proposals for select using (auth.role() = 'authenticated');

create policy "proposals: admin and sales insert"
  on proposals for insert with check (current_user_role() in ('admin', 'sales'));

create policy "proposals: admin and sales update"
  on proposals for update using (current_user_role() in ('admin', 'sales'));

create policy "proposals: admin delete"
  on proposals for delete using (current_user_role() = 'admin');

create policy "contracts: authenticated read"
  on contracts for select using (auth.role() = 'authenticated');

create policy "contracts: admin and sales insert"
  on contracts for insert with check (current_user_role() in ('admin', 'sales'));

create policy "contracts: admin and sales update"
  on contracts for update using (current_user_role() in ('admin', 'sales'));

create policy "contracts: admin delete"
  on contracts for delete using (current_user_role() = 'admin');

-- ── TEMPLATE CLAUSES ─────────────────────────────────────────

create policy "template_clauses: authenticated read"
  on template_clauses for select using (auth.role() = 'authenticated');

create policy "template_clauses: admin write"
  on template_clauses for all using (current_user_role() = 'admin');

-- ── DOCUMENT VERSIONS (immutable) ────────────────────────────

create policy "document_versions: authenticated read"
  on document_versions for select using (auth.role() = 'authenticated');

create policy "document_versions: admin and sales insert"
  on document_versions for insert with check (current_user_role() in ('admin', 'sales'));

-- ── ACTIVITY LOG (append-only) ───────────────────────────────

create policy "activity_logs: authenticated read"
  on activity_logs for select using (auth.role() = 'authenticated');

create policy "activity_logs: authenticated insert"
  on activity_logs for insert with check (auth.role() = 'authenticated');

-- No update/delete policies on activity_logs — it is append-only

-- ============================================================
-- SUPABASE STORAGE BUCKETS
-- ============================================================

-- Run these in the Supabase dashboard SQL editor or via Supabase CLI
-- insert into storage.buckets (id, name, public) values ('proposals', 'proposals', false);
-- insert into storage.buckets (id, name, public) values ('contracts', 'contracts', false);
-- insert into storage.buckets (id, name, public) values ('attachments', 'attachments', false);

-- Storage RLS example for proposals bucket:
-- create policy "proposals bucket: authenticated read"
--   on storage.objects for select
--   using (bucket_id = 'proposals' and auth.role() = 'authenticated');
-- create policy "proposals bucket: admin and sales insert"
--   on storage.objects for insert
--   with check (bucket_id = 'proposals' and current_user_role() in ('admin', 'sales'));
