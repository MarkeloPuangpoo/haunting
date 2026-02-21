-- HarnTung Database Schema
-- Run this in Supabase SQL Editor
-- Enable UUID extension
create extension if not exists "uuid-ossp";
-- Events table
create table events (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    created_at timestamptz default now()
);
-- Members table
create table members (
    id uuid primary key default uuid_generate_v4(),
    event_id uuid references events(id) on delete cascade not null,
    name text not null,
    promptpay_id text
);
-- Split method enum
create type split_method as enum ('equal', 'select', 'custom');
-- Expenses table
create table expenses (
    id uuid primary key default uuid_generate_v4(),
    event_id uuid references events(id) on delete cascade not null,
    paid_by uuid references members(id) on delete cascade not null,
    description text not null,
    amount numeric(12, 2) not null,
    split_method split_method not null default 'equal',
    created_at timestamptz default now()
);
-- Expense splits table
create table expense_splits (
    id uuid primary key default uuid_generate_v4(),
    expense_id uuid references expenses(id) on delete cascade not null,
    member_id uuid references members(id) on delete cascade not null,
    amount numeric(12, 2) not null
);
-- Indexes
create index idx_members_event on members(event_id);
create index idx_expenses_event on expenses(event_id);
create index idx_splits_expense on expense_splits(expense_id);
-- RLS Policies (public access for MVP — no auth)
alter table events enable row level security;
alter table members enable row level security;
alter table expenses enable row level security;
alter table expense_splits enable row level security;
create policy "Public access events" on events for all using (true) with check (true);
create policy "Public access members" on members for all using (true) with check (true);
create policy "Public access expenses" on expenses for all using (true) with check (true);
create policy "Public access splits" on expense_splits for all using (true) with check (true);