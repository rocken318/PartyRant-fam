-- Migration: add opinion game mode support
-- Safe to run on existing DB (uses IF NOT EXISTS / IF EXISTS guards)

-- 1. Drop old mode check constraint (name may vary — use pg_constraint to find it)
do $$
declare
  cname text;
begin
  select conname into cname
    from pg_constraint
   where conrelid = 'games'::regclass
     and contype = 'c'
     and pg_get_constraintdef(oid) like '%mode%';
  if cname is not null then
    execute 'alter table games drop constraint ' || quote_ident(cname);
  end if;
end
$$;

-- 2. Add new mode check including 'opinion'
alter table games
  add constraint games_mode_check
  check (mode in ('trivia', 'polling', 'opinion'));

-- 3. Add lose_rule column
alter table games
  add column if not exists lose_rule text
  check (lose_rule in ('minority', 'majority'));
