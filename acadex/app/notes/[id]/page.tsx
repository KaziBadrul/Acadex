// app/notes/[id]/page.tsx

import NoteFetcher from "@/components/NoteFetcher"; 

interface NotePageProps {
  params: {
    id: string;
  };
}

export default async function NotePage(props: NotePageProps) {
  
  
  const resolvedProps = await props; 
  
  let rawParams;
  try {
      rawParams = await resolvedProps.params; 
  } catch (e) {
      rawParams = resolvedProps.params; 
  }
  

  const idString = rawParams?.id ? String(rawParams.id) : '';
  const noteId = parseInt(idString, 10);
  
  // test123
  // console.log("Final Raw Params: ", rawParams); 
  // console.log("ID String extracted: ", idString); 
  // console.log("Note ID parsed: ", noteId); 


  if (isNaN(noteId)) {
    
    return (
      <div className="p-8 text-center text-red-600">
        Error: Invalid Note ID specified in the URL. (Received: {idString || 'nothing'})
      </div>
    );
  }

 
  return (
    <NoteFetcher noteId={noteId} />
  );
}