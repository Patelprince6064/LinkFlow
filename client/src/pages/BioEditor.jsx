import { useState, useEffect } from "react";
import { useMyBio, useCreateBio, useUpdateBio, useDeleteBio } from "../hooks/useBio";
import { useToast } from "../contexts/ToastContext";
import BioPreview from "../components/BioPreview";
import { EmptyState } from "../components/common/UIComponents";

const THEMES = ["Minimal Light", "Dark Slate", "Gradient"];

const PLATFORMS = ["Instagram", "LinkedIn", "GitHub", "YouTube", "Twitter/X", "Website"];

function BioEditor() {
  const { data: profile, isLoading } = useMyBio();
  const createMutation = useCreateBio();
  const updateMutation = useUpdateBio();
  const deleteMutation = useDeleteBio();
  const toast = useToast();

  const [form, setForm] = useState({
    username: "",
    displayName: "",
    bio: "",
    avatar: "",
    theme: "Minimal Light",
    socialLinks: [],
  });

  const [newPlatform, setNewPlatform] = useState("Website");
  const [newUrl, setNewUrl] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editPlatform, setEditPlatform] = useState("Website");
  const [editUrl, setEditUrl] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username || "",
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        avatar: profile.avatar || "",
        theme: profile.theme || "Minimal Light",
        socialLinks: profile.socialLinks || [],
      });
    }
  }, [profile]);

  const handleSave = () => {
    const data = {
      username: form.username,
      displayName: form.displayName,
      bio: form.bio,
      avatar: form.avatar,
      theme: form.theme,
      socialLinks: form.socialLinks,
    };

    if (profile) {
      updateMutation.mutate(data, {
        onSuccess: () => toast.success("Profile updated successfully"),
        onError: (err) => toast.error(err.response?.data?.message || "Failed to update profile"),
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => toast.success("Profile created successfully"),
        onError: (err) => toast.error(err.response?.data?.message || "Failed to create profile"),
      });
    }
  };

  const handleAddSocial = () => {
    if (!newUrl.trim()) return;
    try {
      const parsed = new URL(newUrl.trim());
      if (!["http:", "https:"].includes(parsed.protocol)) return;
    } catch {
      return;
    }

    setForm((prev) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { platform: newPlatform, label: newPlatform, url: newUrl.trim(), order: prev.socialLinks.length },
      ],
    }));
    setNewUrl("");
  };

  const handleDeleteSocial = (index) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
    setEditingIndex(-1);
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditPlatform(form.socialLinks[index].platform);
    setEditUrl(form.socialLinks[index].url);
  };

  const handleSaveEdit = () => {
    if (!editUrl.trim()) return;
    try {
      const parsed = new URL(editUrl.trim());
      if (!["http:", "https:"].includes(parsed.protocol)) return;
    } catch {
      return;
    }

    setForm((prev) => {
      const updated = [...prev.socialLinks];
      updated[editingIndex] = { ...updated[editingIndex], platform: editPlatform, label: editPlatform, url: editUrl.trim() };
      return { ...prev, socialLinks: updated };
    });
    setEditingIndex(-1);
  };

  const handleMoveSocial = (index, direction) => {
    setForm((prev) => {
      const updated = [...prev.socialLinks];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= updated.length) return prev;
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return {
        ...prev,
        socialLinks: updated.map((s, i) => ({ ...s, order: i })),
      };
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        toast.success("Profile deleted successfully");
        setForm({
          username: "",
          displayName: "",
          bio: "",
          avatar: "",
          theme: "Minimal Light",
          socialLinks: [],
        });
      },
      onError: () => toast.error("Failed to delete profile"),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-accent" />
        <div className="h-96 animate-pulse rounded-lg border border-border bg-card" />
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error?.response?.data?.message || updateMutation.error?.response?.data?.message;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Link-in-Bio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your public bio profile at{" "}
            <span className="font-mono text-foreground">/bio/{form.username || "..."}</span>
          </p>
        </div>
        {profile && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-md border border-destructive/50 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
          >
            Delete profile
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Section title="Settings">
            <Field label="Username">
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="yourusername"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </Field>
            <Field label="Display Name">
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Your Name"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </Field>
            <Field label="Bio">
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell the world about yourself..."
                rows={3}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </Field>
            <Field label="Avatar URL">
              <input
                type="url"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </Field>
            <Field label="Theme">
              <div className="flex gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, theme: t })}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      form.theme === t
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          <Section title="Social Links">
            <div className="space-y-2">
              {form.socialLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md border border-border bg-background p-2">
                  {editingIndex === i ? (
                    <>
                      <select
                        value={editPlatform}
                        onChange={(e) => setEditPlatform(e.target.value)}
                        className="rounded border border-input bg-background px-2 py-1 text-sm"
                      >
                        {PLATFORMS.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                      <input
                        type="url"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm"
                      />
                      <button onClick={handleSaveEdit} className="rounded px-2 py-1 text-xs text-foreground hover:bg-accent">Save</button>
                      <button onClick={() => setEditingIndex(-1)} className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent">Cancel</button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-foreground w-24">{link.platform}</span>
                      <span className="flex-1 truncate text-sm text-muted-foreground">{link.url}</span>
                      <button onClick={() => handleMoveSocial(i, -1)} disabled={i === 0} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button onClick={() => handleMoveSocial(i, 1)} disabled={i === form.socialLinks.length - 1} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <button onClick={() => handleStartEdit(i)} className="rounded p-1 text-muted-foreground hover:bg-accent">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteSocial(i)} className="rounded p-1 text-destructive hover:bg-destructive/10">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Platform</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="flex-[2]">
                <label className="block text-xs font-medium text-muted-foreground mb-1">URL</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === "Enter" && handleAddSocial()}
                />
              </div>
              <button
                onClick={handleAddSocial}
                className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                + Add
              </button>
            </div>
          </Section>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Saving..." : profile ? "Save Changes" : "Create Profile"}
          </button>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-foreground">Live Preview</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <BioPreview profile={form} />
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground">Delete Profile</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete your bio profile? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export default BioEditor;
