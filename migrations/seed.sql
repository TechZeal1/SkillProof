-- SkillProof Seed Data Script
-- Seed Initial Challenges and Demonstration Profiles

INSERT INTO public.profiles (id, username, display_name, bio, university, avatar_url, github_url, selected_skills, is_public, role)
VALUES 
  ('usr_alice_chen', 'alice_chen', 'Alice Chen', 'CS student at Stanford focusing on accessible web architecture and responsive systems.', 'Stanford University', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'https://github.com/alicechen-dev', ARRAY['JavaScript', 'React', 'CSS Architecture', 'Accessibility'], true, 'student'),
  ('usr_mentor_sarah', 'mentor_sarah', 'Dr. Sarah Marcus', 'Lead Technical Mentor & Staff Engineer. Reviewing student evidence for correctness and accessibility.', 'Stanford Web Systems Lab', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'https://github.com/smarcus-eng', ARRAY['Frontend Architecture', 'Code Review', 'Web Standards'], true, 'mentor')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.skills (id, name, category, description)
VALUES
  ('sk_js', 'JavaScript', 'Language', 'Core ECMAScript syntax, event loops, DOM APIs, and async patterns.'),
  ('sk_css', 'CSS Architecture', 'Styling', 'Modern CSS, responsive design, Flexbox, Grid, and tokens.'),
  ('sk_a11y', 'Accessibility (a11y)', 'Standards', 'WCAG compliance, ARIA attributes, semantic structure, screen reader support.'),
  ('sk_react', 'React & State', 'Frontend Framework', 'Declarative UI, hooks, component composition, and unidirectional state.')
ON CONFLICT (id) DO NOTHING;
