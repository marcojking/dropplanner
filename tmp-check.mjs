import { createClient } from '@supabase/supabase-js'

const s = createClient(
  'https://mhdowbwbplmcosepolti.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZG93YndicGxtY29zZXBvbHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTcyOTgsImV4cCI6MjA4OTMzMzI5OH0.puhI2_WtYunPXktVkFnfjMNgwoXvqAoYRd7Lroimp_k'
)

const { data, error } = await s.from('plans').select('id, genre, song_count, release_date, created_at')

if (error) {
  console.log('Error:', error.message)
} else if (!data || data.length === 0) {
  console.log('No plans found in Supabase.')
} else {
  console.log('Found ' + data.length + ' plan(s):')
  data.forEach(p => console.log('  - ' + p.id + ' | ' + p.genre + ' | ' + p.song_count + ' songs | ' + p.release_date + ' | ' + p.created_at))
}
