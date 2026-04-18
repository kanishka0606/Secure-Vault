CREATE TABLE academic_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id text NOT NULL,
  subjects jsonb DEFAULT '[]'::jsonb,
  cgpa numeric DEFAULT 0,
  total_conducted integer DEFAULT 0,
  total_attended integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
