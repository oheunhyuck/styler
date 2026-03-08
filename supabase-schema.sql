-- GPTStyler Supabase Schema
-- Supabase SQL Editor에서 실행하세요.

-- ── styles 테이블 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS styles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL CHECK (char_length(name) <= 60),
  description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 200),
  css         TEXT NOT NULL,
  author      TEXT NOT NULL CHECK (char_length(author) <= 30),
  likes       INTEGER NOT NULL DEFAULT 0,
  views       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 좋아요 증가 함수
CREATE OR REPLACE FUNCTION increment_likes(style_id UUID)
RETURNS VOID AS $$
  UPDATE styles SET likes = likes + 1 WHERE id = style_id;
$$ LANGUAGE SQL;

-- 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_views(style_id UUID)
RETURNS VOID AS $$
  UPDATE styles SET views = views + 1 WHERE id = style_id;
$$ LANGUAGE SQL;

ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read styles"  ON styles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert styles" ON styles FOR INSERT WITH CHECK (true);

-- ── comments 테이블 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id   UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  author     TEXT NOT NULL CHECK (char_length(author) <= 30),
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read comments"  ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON comments FOR INSERT WITH CHECK (true);



