"use client";

import type React from "react";
import { useActionState, useState } from "react";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import {
  createTeamMemberAction,
  deleteTeamMemberAction,
  reorderTeamMemberAction,
  toggleTeamMemberPublishedAction,
  updateTeamMemberAction,
  type AdminTeamMember,
  type TeamActionState,
} from "@/actions/team";
import { MediaInput } from "@/components/admin/MediaInput";

const initialState: TeamActionState = { success: false, message: "" };

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-gold hover:text-brand-black disabled:opacity-50"
    >
      {pending ? "Saving..." : children}
    </button>
  );
}

function TeamForm({
  action,
  member,
  onDone,
}: {
  action: (state: TeamActionState, formData: FormData) => Promise<TeamActionState>;
  member?: AdminTeamMember;
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [photo, setPhoto] = useState(member?.photo ?? "");

  return (
    <form action={formAction} className="space-y-4 border border-brand-charcoal/10 bg-white p-6">
      {member ? <input type="hidden" name="id" value={member.id} /> : null}
      <input type="hidden" name="photo" value={photo} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold">
          Name
          <input name="name" required defaultValue={member?.name} className="mt-1 w-full border border-brand-charcoal/20 p-3" />
        </label>
        <label className="text-sm font-semibold">
          Nepali Name
          <input name="nameNe" defaultValue={member?.nameNe} className="mt-1 w-full border border-brand-charcoal/20 p-3" />
        </label>
        <label className="text-sm font-semibold">
          Designation
          <input name="designation" required defaultValue={member?.designation} className="mt-1 w-full border border-brand-charcoal/20 p-3" />
        </label>
        <label className="text-sm font-semibold">
          Department
          <input name="department" defaultValue={member?.department} className="mt-1 w-full border border-brand-charcoal/20 p-3" />
        </label>
        <label className="text-sm font-semibold">
          Group
          <select name="group" required defaultValue={member?.group ?? "PEOPLE"} className="mt-1 w-full border border-brand-charcoal/20 p-3">
            <option value="LEADERSHIP">Leadership</option>
            <option value="PEOPLE">People</option>
            <option value="BOTH">Both</option>
          </select>
        </label>
        <label className="flex items-center gap-2 pt-7 text-sm font-semibold">
          <input type="checkbox" name="isPublished" defaultChecked={member?.isPublished ?? false} />
          Published
        </label>
        <label className="text-sm font-semibold">
          Email
          <input name="email" type="email" defaultValue={member?.email} className="mt-1 w-full border border-brand-charcoal/20 p-3" />
        </label>
        <label className="text-sm font-semibold">
          Phone
          <input name="phone" defaultValue={member?.phone} className="mt-1 w-full border border-brand-charcoal/20 p-3" />
        </label>
        <label className="text-sm font-semibold md:col-span-2">
          LinkedIn
          <input name="linkedIn" type="url" defaultValue={member?.linkedIn} className="mt-1 w-full border border-brand-charcoal/20 p-3" />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Bio
        <textarea name="bio" rows={4} defaultValue={member?.bio} className="mt-1 w-full border border-brand-charcoal/20 p-3" />
      </label>
      <MediaInput
        label="Profile Photo"
        value={photo}
        onChange={(_, url) => setPhoto(url)}
        allowedResourceTypes={["IMAGE"]}
        uploadPurpose="cms_image"
      />
      <label className="block text-sm font-semibold">
        Photo Alt Text
        <input name="photoAltText" defaultValue={member?.photoAltText ?? member?.name} className="mt-1 w-full border border-brand-charcoal/20 p-3" />
      </label>
      {state.message ? (
        <p role="status" className={state.success ? "text-sm text-green-700" : "text-sm text-red-700"}>{state.message}</p>
      ) : null}
      <div className="flex gap-3">
        <SubmitButton>{member ? "Update Member" : "Add Member"}</SubmitButton>
        {onDone ? (
          <button type="button" onClick={onDone} className="px-4 py-2 text-sm font-semibold text-brand-muted hover:text-brand-black">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

function IconAction({
  action,
  children,
  title,
  confirmMessage,
  fields,
}: {
  action: (state: TeamActionState, formData: FormData) => Promise<TeamActionState>;
  children: React.ReactNode;
  title: string;
  confirmMessage?: string;
  fields: Record<string, string>;
}) {
  const [state, formAction] = useActionState(action, initialState);
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirmMessage && !confirm(confirmMessage)) event.preventDefault();
      }}
      className="inline-flex"
      title={state.message || title}
    >
      {Object.entries(fields).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
      <button type="submit" className="p-2 text-brand-muted hover:text-brand-black" aria-label={title}>
        {children}
      </button>
    </form>
  );
}

export function TeamManager({ members }: { members: AdminTeamMember[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = members.find((member) => member.id === editingId);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden border border-brand-charcoal/10 bg-white">
        <div className="border-b border-brand-charcoal/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-brand-black">Current Team Members</h2>
        </div>
        <div className="divide-y divide-brand-charcoal/10">
          {members.length === 0 ? (
            <p className="p-6 text-sm text-brand-muted">No team members have been added yet.</p>
          ) : members.map((member, index) => (
            <div key={member.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 p-4">
              <div className="relative h-14 w-14 overflow-hidden bg-brand-charcoal/5">
                {member.photo ? (
                  <Image src={member.photo} alt={member.photoAltText || member.name} fill className="object-cover" />
                ) : null}
              </div>
              <div>
                <p className="font-semibold text-brand-black">{member.name}</p>
                <p className="text-sm text-brand-muted">{member.designation}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-brand-gold">{member.group ?? "PEOPLE"} | {member.isPublished ? "Published" : "Hidden"}</p>
              </div>
              <div className="flex items-center gap-1">
                <IconAction action={reorderTeamMemberAction} title="Move up" fields={{ id: member.id, direction: "up" }}><ArrowUp className="h-4 w-4" /></IconAction>
                <IconAction action={reorderTeamMemberAction} title="Move down" fields={{ id: member.id, direction: "down" }}><ArrowDown className="h-4 w-4" /></IconAction>
                <IconAction action={toggleTeamMemberPublishedAction} title={member.isPublished ? "Hide" : "Publish"} fields={{ id: member.id }}>{member.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</IconAction>
                <button type="button" onClick={() => setEditingId(member.id)} className="p-2 text-brand-muted hover:text-brand-black" aria-label={`Edit ${member.name}`}>
                  <Pencil className="h-4 w-4" />
                </button>
                <IconAction action={deleteTeamMemberAction} title="Delete" confirmMessage={`Delete ${member.name}?`} fields={{ id: member.id }}><Trash2 className="h-4 w-4" /></IconAction>
              </div>
              {editing?.id === member.id ? (
                <div className="col-span-3">
                  <TeamForm action={updateTeamMemberAction} member={editing} onDone={() => setEditingId(null)} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-brand-black">Add Team Member</h2>
        <TeamForm action={createTeamMemberAction} />
      </section>
    </div>
  );
}
