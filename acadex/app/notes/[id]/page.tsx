// app/notes/[id]/page.tsx
// This is an async Server Component WRAPPER.

import NoteFetcher from "@/components/NoteFetcher"; 

interface NotePageProps {
  params: {
    id: string;
  };
}

export default async function NotePage(props: NotePageProps) {
  
  // 1. Await the outer promise wrapper (props)
  const resolvedProps = await props; 
  
  // 2. Await the inner promise wrapper (resolvedProps.params)
  // TypeScript will complain, but the runtime requires this hack to unwrap the internal Promise.
  // We explicitly check the property 'params' on the resolved object.
  let rawParams;
  try {
      rawParams = await resolvedProps.params; 
  } catch (e) {
      // Fallback for cases where it wasn't a Promise after all (unlikely given your logs)
      rawParams = resolvedProps.params; 
  }
  
  // 3. Extract the ID string
  const idString = rawParams?.id ? String(rawParams.id) : '';
  const noteId = parseInt(idString, 10);
  
  // Use the console logs to confirm the fix
  console.log("Final Raw Params: ", rawParams); // Should now be { id: '1' }
  console.log("ID String extracted: ", idString); // Should print '1'
  console.log("Note ID parsed: ", noteId); // Should print 1 (number)


  if (isNaN(noteId)) {
    // We display the raw string we tried to parse for better debugging
    return (
      <div className="p-8 text-center text-red-600">
        Error: Invalid Note ID specified in the URL. (Received: {idString || 'nothing'})
      </div>
    );
  }

  // 4. Render the Client Component and pass the validated ID
  return (
    <NoteFetcher noteId={noteId} />
  );
}