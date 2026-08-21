-- Per-shop punch in/out (dwell-time tracking) + expense receipts.
-- A visit row is now created at shop punch-in (shop identity + selfie +
-- location) and closed at shop punch-out (status, feedback, visiting card,
-- exit location). punch_out_at IS NULL means the salesman is still there.

alter table visits add column punch_out_at timestamptz;
alter table visits add column punch_out_lat double precision;
alter table visits add column punch_out_lng double precision;

comment on column visits.latitude is 'Punch-in (arrival) location.';
comment on column visits.longitude is 'Punch-in (arrival) location.';
comment on column visits.selfie_path is 'Captured at shop punch-in.';
comment on column visits.visiting_card_path is 'Captured at shop punch-out.';

-- Only one shop can be open at a time per salesman.
create unique index visits_open_unique on visits (salesman_id) where punch_out_at is null;

alter table expenses add column receipt_path text;

comment on column expenses.receipt_path is 'Optional bill/receipt photo, in the visit-photos bucket under {salesman_id}/expenses/{expense_id}/.';
