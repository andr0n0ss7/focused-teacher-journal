from pathlib import Path

path = Path('/home/ubuntu/focused-teacher-journal/client/src/pages/Home.tsx')
text = path.read_text()
start = text.index('function StudentNotes(')
end = text.index('function NoteBlock', start)
replacement = r'''function StudentNotes({ state, update }: { state: PlannerState; update: (recipe: (draft: PlannerState) => void) => void }) {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const individualClassId = params.get("classId") ?? "";
  const individualMemberId = params.get("memberId") ?? "";
  const individualClass = state.identity.classes.find(item => item.id === individualClassId);
  const individualMember = individualClass?.members.find(item => item.id === individualMemberId);
  const visibleNotes = individualMemberId
    ? state.studentNotes.filter(note => note.classId === individualClassId && note.rosterMemberId === individualMemberId)
    : state.studentNotes;
  const individualContacts = individualMemberId
    ? state.parentContacts.filter(contact => contact.classId === individualClassId && (contact.rosterMemberId === individualMemberId || (!contact.rosterMemberId && contact.student === individualMember?.name)))
    : [];
  const blank: Omit<StudentNote, "id"> = {
    name: individualMember?.name ?? "",
    classId: individualClassId,
    rosterMemberId: individualMemberId,
    strengths: "",
    evidence: "",
    supportNeeds: "",
    studentVoice: "",
    nextAction: "",
    reviewDate: "",
  };
  const [draft, setDraft] = useState(blank);
  const selectedMembers = state.identity.classes.find(item => item.id === draft.classId)?.members ?? [];
  const selectedRosterMember = selectedMembers.find(member => member.id === draft.rosterMemberId);
  const add = () => {
    if (!draft.name.trim() || !draft.rosterMemberId) return;
    update(d => {
      d.studentNotes.unshift({ ...draft, id: uid(), name: selectedRosterMember?.name ?? draft.name });
    });
    setDraft(blank);
  };
  return (
    <>
      <SectionIntro
        eyebrow="07 · Learners"
        title={individualMember ? `${individualMember.name}'s learner page.` : "Keep the whole learner in view."}
        description={individualMember ? `Notes and family context for ${individualMember.name} in ${individualClass?.name || "this class"}. Parent/carer details stay closed until you choose to open them.` : "Use factual, respectful notes that connect strengths, evidence, support needs, student voice, and the next review."}
      />
      <Card>
        <CardHeader><p className="eyebrow">New student or group note</p></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <select className="planner-select" value={draft.classId} onChange={event => setDraft({ ...draft, classId: event.target.value, name: "", rosterMemberId: "" })}>
            <option value="">Class</option>
            {state.identity.classes.map((item, index) => <option key={item.id} value={item.id}>{item.name || `Class ${index + 1}`}</option>)}
          </select>
          <select className="planner-select" value={draft.rosterMemberId} onChange={event => { const member = selectedMembers.find(item => item.id === event.target.value); setDraft({ ...draft, rosterMemberId: event.target.value, name: member?.name ?? "" }); }} disabled={!draft.classId || selectedMembers.length === 0}>
            <option value="">Choose roster member</option>
            {selectedMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
          </select>
          {(["strengths", "evidence", "supportNeeds", "studentVoice", "nextAction"] as const).map(key => <Textarea key={key} placeholder={{ strengths: "Strengths / interests / motivators", evidence: "Current learning evidence", supportNeeds: "Support needs / adaptations / extension", studentVoice: "Student voice / questions", nextAction: "Next action" }[key]} value={draft[key]} onChange={event => setDraft({ ...draft, [key]: event.target.value })} />)}
          <div className="flex gap-3"><Input type="date" value={draft.reviewDate} onChange={event => setDraft({ ...draft, reviewDate: event.target.value })} /><Button onClick={add} className="gap-2"><Plus className="h-4 w-4" />Add note</Button></div>
        </CardContent>
      </Card>
      <div className="mt-5 space-y-4">
        {visibleNotes.length ? visibleNotes.map(note => (
          <Card key={note.id}>
            <CardHeader className="flex-row items-start justify-between"><div><p className="eyebrow">{state.identity.classes.find(item => item.id === note.classId)?.name || "Shared"}</p><CardTitle className="mt-1 text-lg">{getLinkedStudentName(state, note)}</CardTitle></div><button onClick={() => update(d => { d.studentNotes = d.studentNotes.filter(item => item.id !== note.id); })} className="icon-button"><Trash2 className="h-4 w-4" /></button></CardHeader>
            <CardContent className="grid gap-4 text-sm md:grid-cols-2"><NoteBlock label="Strengths" value={note.strengths} /><NoteBlock label="Evidence" value={note.evidence} /><NoteBlock label="Support" value={note.supportNeeds} /><NoteBlock label="Student voice" value={note.studentVoice} /><NoteBlock label="Next action" value={note.nextAction} /><NoteBlock label="Review date" value={note.reviewDate || "Not set"} /></CardContent>
          </Card>
        )) : <EmptyState title="No student notes yet" detail="Start with one student or group and keep the note grounded in what you saw and what you will do next." />}
      </div>
      {individualMember && (
        <details className="learner-contact-details mt-6">
          <summary><span><span className="eyebrow">Family context</span><strong>Parent / carer contacts</strong></span><span className="text-xs text-muted-foreground">Open details</span></summary>
          <div className="mt-4 space-y-3">
            {individualContacts.length ? individualContacts.map(contact => <div key={contact.id} className="contact-detail-row"><div><p className="eyebrow">{contact.date} · {contact.contact || "Contact route not set"}</p><p className="mt-1 text-sm font-medium">{contact.reason || "Reason not recorded"}</p></div><div className="text-sm text-muted-foreground"><p>{contact.summary || "No summary recorded."}</p><p className="mt-1">Agreement: {contact.agreement || "—"}{contact.followUpDate ? ` · Follow up ${contact.followUpDate}` : ""}</p></div></div>) : <p className="text-sm text-muted-foreground">No parent/carer contacts are linked to this learner yet.</p>}
            <Button variant="outline" size="sm" onClick={() => setLocation(`/?section=parents&classId=${encodeURIComponent(individualClass?.id ?? "")}&student=${encodeURIComponent(individualMember.name)}`)}>Open full contact log</Button>
          </div>
        </details>
      )}
    </>
  );
}
'''
path.write_text(text[:start] + replacement + text[end:])
