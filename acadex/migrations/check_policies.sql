SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'note_requests';

SELECT * FROM note_requests LIMIT 5;
