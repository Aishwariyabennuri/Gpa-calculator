/*
# Create GPA Calculator Schema

1. New Tables
- `semesters`: stores semester records with name, year, and is_simulation flag
- `subjects`: stores subject records with name, credits, grade, and foreign key to semesters

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD since this is a single-tenant app without auth.

3. Important Notes
- is_simulation flag distinguishes real semesters from "what if" scenarios
- Grade stored as letter (A, B, C, etc.) for display, converted to points for calculation
- Standard GPA scale: A=4.0, B=3.0, C=2.0, D=1.0, F=0.0
*/

CREATE TABLE IF NOT EXISTS semesters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  year int NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::int,
  is_simulation boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id uuid NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  name text NOT NULL,
  credits int NOT NULL CHECK (credits > 0 AND credits <= 10),
  grade text NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'F', 'A+', 'A-')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subjects_semester_id ON subjects(semester_id);

ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_semesters" ON semesters;
CREATE POLICY "anon_select_semesters" ON semesters FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_semesters" ON semesters;
CREATE POLICY "anon_insert_semesters" ON semesters FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_semesters" ON semesters;
CREATE POLICY "anon_update_semesters" ON semesters FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_semesters" ON semesters;
CREATE POLICY "anon_delete_semesters" ON semesters FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_subjects" ON subjects;
CREATE POLICY "anon_select_subjects" ON subjects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_subjects" ON subjects;
CREATE POLICY "anon_insert_subjects" ON subjects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_subjects" ON subjects;
CREATE POLICY "anon_update_subjects" ON subjects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_subjects" ON subjects;
CREATE POLICY "anon_delete_subjects" ON subjects FOR DELETE
  TO anon, authenticated USING (true);