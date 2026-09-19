import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLinks, useCreateLink, useUpdateLink, useDeleteLink } from "../hooks/useLinks";
import { useToast } from "../contexts/ToastContext";
import { EmptyState } from "../components/common/UIComponents";
import QRCodeModal from "../components/QRCodeModal";

function Links() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editLink, setEditLink] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [qrLink, setQrLink] = useState(null);
  const toast = useToast();

  const { data, isLoading, error } = useLinks({ page, search: debouncedSearch });
  const createMutation = useCreateLink();
  const updateMutation = useUpdateLink();
  const deleteMutation = useDeleteLink();

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearch(value);
    const timeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Short link copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const links = data?.links || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Links</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Create link
        </button>
      </div>

      <div className="mt-4">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search links..."
            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {isLoading && (
        <div className="mt-8 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-card" />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive-foreground">
          Failed to load links. Please try again.
        </div>
      )}

      {!isLoading && !error && links.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title={debouncedSearch ? "No links match your search" : "No links yet"}
            description={debouncedSearch ? "Try a different search term." : "Create your first short link to start tracking clicks."}
            action={
              !debouncedSearch && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Create link
                </button>
              )
            }
          />
        </div>
      )}

      {!isLoading && links.length > 0 && (
        <div className="mt-4 space-y-3 lg:space-y-0">
          <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Short Link</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Destination</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Clicks</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-mono text-foreground">{link.shortCode}</span>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground" title={link.destinationUrl}>
                      {link.destinationUrl}
                    </td>
                    <td className="px-4 py-3 text-foreground">{link.clickCount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          link.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {link.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/dashboard/analytics/${link.id}`}
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="View analytics"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setQrLink(link)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="QR Code"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        </button>
                        <a
                          href={link.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="Open in new tab"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        <button
                          onClick={() => handleCopy(link.shortUrl)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="Copy"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setEditLink(link)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            updateMutation.mutate({ id: link.id, isActive: !link.isActive })
                          }
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          title={link.isActive ? "Disable" : "Enable"}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {link.isActive ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(link)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive-foreground"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {links.map((link) => (
              <div key={link.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-medium text-foreground">/{link.shortCode}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground" title={link.destinationUrl}>
                      {link.destinationUrl}
                    </p>
                  </div>
                  <span
                    className={`ml-2 inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      link.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {link.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{link.clickCount} clicks</span>
                    <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleCopy(link.shortUrl)} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="Copy">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    </button>
                    <button onClick={() => setQrLink(link)} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="QR">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                    </button>
                    <button onClick={() => setEditLink(link)} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="Edit">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => setDeleteConfirm(link)} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive-foreground" title="Delete">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {showCreate && (
        <CreateLinkModal
          onClose={() => setShowCreate(false)}
          onSubmit={(data) =>
            createMutation.mutate(data, {
              onSuccess: () => {
                setShowCreate(false);
                toast.success("Link created successfully");
              },
              onError: (err) => toast.error(err.response?.data?.message || "Failed to create link"),
            })
          }
          isLoading={createMutation.isPending}
          error={createMutation.error?.response?.data?.message}
        />
      )}

      {editLink && (
        <EditLinkModal
          link={editLink}
          onClose={() => setEditLink(null)}
          onSubmit={(data) =>
            updateMutation.mutate(
              { id: editLink.id, ...data },
              {
                onSuccess: () => {
                  setEditLink(null);
                  toast.success("Link updated successfully");
                },
                onError: (err) => toast.error(err.response?.data?.message || "Failed to update link"),
              }
            )
          }
          isLoading={updateMutation.isPending}
          error={updateMutation.error?.response?.data?.message}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          link={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() =>
            deleteMutation.mutate(deleteConfirm.id, {
              onSuccess: () => {
                setDeleteConfirm(null);
                toast.success("Link deleted successfully");
              },
              onError: () => toast.error("Failed to delete link"),
            })
          }
          isLoading={deleteMutation.isPending}
        />
      )}

      {qrLink && (
        <QRCodeModal
          shortCode={qrLink.shortCode}
          shortUrl={qrLink.shortUrl}
          onClose={() => setQrLink(null)}
        />
      )}
    </div>
  );
}

function CreateLinkModal({ onClose, onSubmit, isLoading, error }) {
  const [form, setForm] = useState({ destinationUrl: "", customSlug: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      destinationUrl: form.destinationUrl,
      customSlug: form.customSlug || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">Create Short Link</h2>
        {error && (
          <div className="mt-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive-foreground">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="create-url" className="block text-sm font-medium text-foreground">
              Destination URL
            </label>
            <input
              id="create-url"
              type="url"
              required
              value={form.destinationUrl}
              onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })}
              className="mt-1 block h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label htmlFor="create-slug" className="block text-sm font-medium text-foreground">
              Custom slug <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="create-slug"
              type="text"
              value={form.customSlug}
              onChange={(e) => setForm({ ...form, customSlug: e.target.value })}
              className="mt-1 block h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="my-custom-slug"
            />
            <p className="mt-1 text-xs text-muted-foreground">3-20 characters: letters, numbers, hyphens, underscores</p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditLinkModal({ link, onClose, onSubmit, isLoading, error }) {
  const [form, setForm] = useState({
    destinationUrl: link.destinationUrl,
    customSlug: link.shortCode,
    isActive: link.isActive,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      destinationUrl: form.destinationUrl,
      customSlug: form.customSlug,
      isActive: form.isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">Edit Link</h2>
        {error && (
          <div className="mt-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive-foreground">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="edit-url" className="block text-sm font-medium text-foreground">Destination URL</label>
            <input
              id="edit-url"
              type="url"
              required
              value={form.destinationUrl}
              onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })}
              className="mt-1 block h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="edit-slug" className="block text-sm font-medium text-foreground">Custom slug</label>
            <input
              id="edit-slug"
              type="text"
              required
              value={form.customSlug}
              onChange={(e) => setForm({ ...form, customSlug: e.target.value })}
              className="mt-1 block h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-active"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="edit-active" className="text-sm text-foreground">Active</label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ link, onClose, onConfirm, isLoading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">Delete Link</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you sure you want to delete <strong className="font-mono">/{link.shortCode}</strong>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Links;
