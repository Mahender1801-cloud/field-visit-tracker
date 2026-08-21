-- Adds a "User ID" (username) login path alongside email, so admins/salesmen
-- can sign in with either. Also makes `active` enforceable at login time.

alter table profiles add column username text unique;
create index profiles_username_idx on profiles (username);

comment on column profiles.username is 'Optional short login handle ("User ID"), alternative to email sign-in.';
