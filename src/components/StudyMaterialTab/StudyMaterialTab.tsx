'use client';

// StudyMaterialTab component (Requirements 1.2, 10.5, 11.1, 11.5, 11.16).
//
// The content-management surface for an authenticated Admin, extracted from the
// admin dashboard page so it can be composed beside the Test Series Tab. Every
// mutation is performed through the `useAdminMaterials` hook, which sends the
// persisted role_admin Bearer token so only an Admin holding role_admin may
// perform these Content Management Actions (Req 10.5, 11.16). An unauthenticated
// visitor is redirected to the account page to sign in.
//
// Capabilities:
//   - Upload a Study Material (title, optional description, optional price,
//     file) and attach Categories, Subjects, and Jobs — each chosen from the
//     existing set or typed in to be auto-created (Req 11.1, 2.2, 0.1).
//   - Edit a Study Material's title/description/price and delete it (Req 11.5,
//     11.3).
//
// Classifications are presented as three flat pick-or-create fields
// (Categories, Subjects, Jobs); there is no separate Category Type / Category
// management surface. All styling lives in `StudyMaterialTab.module.scss` (no
// inline CSS).

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import LoadingIndicator from '@/components/LoadingIndicator/LoadingIndicator';
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage';
import EmptyState from '@/components/EmptyState/EmptyState';
import { useAdminMaterials } from '@/hooks/api/useAdminMaterials';
import { useAccessToken } from '@/hooks/useAccessToken';
import { buildApiUrl } from '@/hooks/api/apiClient';
import { API_ROUTES } from '@/hooks/api/apiClient.constant';
import type { AdminMaterialFile } from '@/hooks/api/useAdminMaterials.types';
import type { MaterialDetail } from '@/hooks/api/apiHooks.types';
import { httpRequest } from '@/utils/http';
import type { HttpError, HttpResult } from '@/utils/http.types';
import type { CatalogCategory } from '@/utils/catalogTree.types';
import { DEFAULT_CURRENCY, MAX_PAID_AMOUNT } from '@/utils/price.constant';

import styles from './StudyMaterialTab.module.scss';
import type {
  CategoryPickerProps,
  DashboardCatalog,
  DashboardFeedback,
  DashboardMaterial,
  LinkGroupEditorProps,
  LinkTargetOption,
  MaterialEditDraft,
  MaterialFilesEditorProps,
  MaterialMultiPickerProps,
  MaterialOption,
  ParsedPrice,
} from './StudyMaterialTab.types';
import {
  ADD_CATEGORY_LABEL,
  ADMIN_LOGIN_PATH,
  CANCEL_LABEL,
  CATALOG_ERROR_MESSAGE,
  CATALOG_ERROR_TITLE,
  CATEGORIES_HINT,
  CATEGORIES_LABEL,
  DASHBOARD_SUBTITLE,
  DASHBOARD_TITLE,
  DELETE_LABEL,
  DELETE_SUCCESS_MESSAGE,
  EDIT_LABEL,
  FILE_REQUIRED_ERROR,
  GENERAL_CATEGORY_TYPE_NAME,
  GENERIC_ACTION_ERROR,
  JOB_CATEGORY_TYPE_NAME,
  JOBS_HINT,
  JOBS_LABEL,
  LINK_MATERIALS_LABEL,
  LINK_MATERIALS_PLACEHOLDER_OPTION,
  LINK_NO_CHANGE_MESSAGE,
  LINK_SUBMIT_LABEL,
  LINK_SUCCESS_MESSAGE,
  UNLINK_NO_CHANGE_MESSAGE,
  UNLINK_SUCCESS_MESSAGE,
  LINKED_MATERIALS_EMPTY_TEXT,
  LINKED_MATERIALS_HINT,
  LINKED_MATERIALS_LABEL,
  LINKED_MATERIALS_LOADING_TEXT,
  NO_OTHER_MATERIALS_TEXT,
  UPLOAD_LINK_LABEL,
  UPLOAD_LINK_HINT,
  UPLOAD_LINK_PLACEHOLDER_OPTION,
  UPLOAD_LINK_EMPTY_TEXT,
  UNLINK_LABEL,
  LOGOUT_LABEL,
  MATERIAL_DESCRIPTION_FIELD_ID,
  MATERIAL_DESCRIPTION_LABEL,
  MATERIAL_DESCRIPTION_PLACEHOLDER,
  MATERIAL_FILE_FIELD_ID,
  MATERIAL_FILE_HINT,
  MATERIAL_FILE_LABEL,
  MATERIAL_PRICE_FIELD_ID,
  MATERIAL_PRICE_HINT,
  MATERIAL_PRICE_LABEL,
  MATERIAL_PRICE_PLACEHOLDER,
  MATERIAL_TITLE_FIELD_ID,
  MATERIAL_TITLE_LABEL,
  MATERIAL_TITLE_PLACEHOLDER,
  MATERIALS_EMPTY_MESSAGE,
  MATERIALS_SECTION_TITLE,
  NEW_CATEGORY_INPUT_ID,
  NEW_CATEGORY_INPUT_PLACEHOLDER,
  NEW_JOB_INPUT_ID,
  NEW_JOB_INPUT_PLACEHOLDER,
  NEW_SUBJECT_INPUT_ID,
  NEW_SUBJECT_INPUT_PLACEHOLDER,
  NO_EXISTING_CATEGORIES_TEXT,
  NO_EXISTING_JOBS_TEXT,
  NO_EXISTING_SUBJECTS_TEXT,
  PRICE_INVALID_ERROR,
  REMOVE_CATEGORY_LABEL,
  RETRY_LABEL,
  SAVE_LABEL,
  SUBJECT_CATEGORY_TYPE_NAME,
  SUBJECTS_HINT,
  SUBJECTS_LABEL,
  TITLE_REQUIRED_ERROR,
  UPDATE_SUCCESS_MESSAGE,
  UPLOAD_SECTION_TITLE,
  UPLOAD_SUBMIT_LABEL,
  UPLOAD_SUCCESS_MESSAGE,
  FILES_LABEL,
  FILES_HINT,
  FILES_LOADING_TEXT,
  FILES_EMPTY_TEXT,
  FILES_ERROR_TEXT,
  ADD_FILES_INPUT_ID,
  ADD_FILES_LABEL,
  REMOVE_FILE_LABEL,
  FILE_ADDED_MESSAGE,
  FILE_REMOVED_MESSAGE,
} from './StudyMaterialTab.constant';

/**
 * Collect the de-duplicated Category names defined under the Category Type with
 * the given name (for example "General", "Subject", or "Job"). A Category Type
 * that does not exist yet simply yields an empty list.
 */
function collectCategoryNamesForType(
  catalog: DashboardCatalog,
  categoryTypeName: string,
): string[] {
  const names = new Set<string>();
  for (const type of catalog.categoryTypes) {
    if (type.name !== categoryTypeName) {
      continue;
    }
    for (const category of type.categories as CatalogCategory[]) {
      const name = category.name.trim();
      if (name.length > 0) {
        names.add(name);
      }
    }
  }
  return Array.from(names);
}

/**
 * Parse the raw Price-field input into a Price amount. An empty/whitespace
 * value or 0 maps to a Free Material (`amount: null`); a whole number in
 * `1..1000000` maps to a Paid Material. Any other value (non-numeric,
 * fractional, negative, or above the max) is rejected (Req 11.13–11.15).
 */
function parsePriceInput(raw: string): ParsedPrice {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: true, amount: null };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false };
  }
  const amount = Number(trimmed);
  if (!Number.isInteger(amount) || amount < 0 || amount > MAX_PAID_AMOUNT) {
    return { ok: false };
  }
  return { ok: true, amount: amount === 0 ? null : amount };
}

/** Derive the Price-field display string from a stored Price amount. */
function priceToDraft(amount?: number | null): string {
  return typeof amount === 'number' && amount > 0 ? String(amount) : '';
}

/**
 * A reusable pick-or-create classification field. Existing values are shown as
 * toggle chips; a text input adds a new name (to be auto-created on upload).
 * Used identically for Categories, Subjects, and Jobs (Req 0.1, 2.2).
 */
function CategoryPicker({
  label,
  hint,
  inputId,
  placeholder,
  emptyText,
  existingNames,
  selected,
  onSelectedChange,
  inputValue,
  onInputChange,
  disabled,
}: CategoryPickerProps) {
  const toggle = (name: string): void => {
    onSelectedChange(
      selected.includes(name)
        ? selected.filter((entry) => entry !== name)
        : [...selected, name],
    );
  };

  const addTyped = (): void => {
    const name = inputValue.trim();
    if (name.length === 0) {
      return;
    }
    if (!selected.includes(name)) {
      onSelectedChange([...selected, name]);
    }
    onInputChange('');
  };

  return (
    <div className={styles.categoryPicker}>
      <p className={styles.fieldGroupLabel}>{label}</p>
      <p className={styles.categoryHint}>{hint}</p>

      {selected.length > 0 && (
        <ul className={styles.tagList}>
          {selected.map((name) => (
            <li key={name} className={styles.tag}>
              <span className={styles.tagName}>{name}</span>
              <button
                type="button"
                className={styles.tagRemove}
                disabled={disabled}
                aria-label={`${REMOVE_CATEGORY_LABEL} ${name}`}
                onClick={() => toggle(name)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {existingNames.length > 0 ? (
        <div className={styles.categoryChoices}>
          {existingNames.map((name) => {
            const isSelected = selected.includes(name);
            return (
              <button
                key={name}
                type="button"
                className={
                  isSelected
                    ? `${styles.categoryChoice} ${styles.categoryChoiceSelected}`
                    : styles.categoryChoice
                }
                disabled={disabled}
                aria-pressed={isSelected}
                onClick={() => toggle(name)}
              >
                {name}
              </button>
            );
          })}
        </div>
      ) : (
        <p className={styles.emptyText}>{emptyText}</p>
      )}

      <div className={styles.inlineForm}>
        <Input
          id={inputId}
          className={styles.grow}
          label={label}
          hideLabel
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTyped();
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || inputValue.trim().length === 0}
          onClick={addTyped}
        >
          {ADD_CATEGORY_LABEL}
        </Button>
      </div>
    </div>
  );
}

/**
 * Collapse a flat list of materials into choosable link targets: each ungrouped
 * material is its own target, while all materials sharing a Link Group collapse
 * into a single target labelled with every member (picking it links to the
 * whole group, which the Backend merges). Group targets are keyed by a
 * representative member id.
 */
function collapseToLinkTargets(
  materials: MaterialOption[],
): LinkTargetOption[] {
  const ungrouped: LinkTargetOption[] = [];
  const groups = new Map<string, MaterialOption[]>();
  for (const material of materials) {
    const groupId = material.linkGroupId ?? null;
    if (groupId === null) {
      ungrouped.push({
        value: material.id,
        label: material.title,
        memberIds: [material.id],
      });
    } else {
      const members = groups.get(groupId) ?? [];
      members.push(material);
      groups.set(groupId, members);
    }
  }
  const grouped: LinkTargetOption[] = [];
  for (const members of groups.values()) {
    if (members.length === 0) {
      continue;
    }
    grouped.push({
      value: members[0].id,
      label:
        members.length > 1
          ? `Group: ${members.map((m) => m.title).join(' + ')}`
          : members[0].title,
      memberIds: members.map((m) => m.id),
    });
  }
  return [...ungrouped, ...grouped];
}

/**
 * Inline multi-select picker for choosing existing materials to link a new
 * upload with. Selected materials render as removable chips; a dropdown adds
 * one at a time. Purely local selection — the actual grouping happens on the
 * Backend after the material is created (linked-material-entitlement Req 1.1–1.4).
 */
function MaterialMultiPicker({
  label,
  hint,
  placeholderOption,
  emptyText,
  options,
  selectedIds,
  onSelectedChange,
  disabled,
}: MaterialMultiPickerProps) {
  // Collapse grouped materials into single targets so a group shows once.
  const targets = useMemo(() => collapseToLinkTargets(options), [options]);

  const labelByValue = useMemo(() => {
    const map = new Map<string, string>();
    for (const target of targets) {
      map.set(target.value, target.label);
    }
    return map;
  }, [targets]);

  const available = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return targets.filter((target) => !selectedSet.has(target.value));
  }, [targets, selectedIds]);

  const remove = (id: string): void => {
    onSelectedChange(selectedIds.filter((entry) => entry !== id));
  };

  const add = (id: string): void => {
    if (id.length > 0 && !selectedIds.includes(id)) {
      onSelectedChange([...selectedIds, id]);
    }
  };

  return (
    <div className={styles.categoryPicker}>
      <p className={styles.fieldGroupLabel}>{label}</p>
      <p className={styles.categoryHint}>{hint}</p>

      {selectedIds.length > 0 && (
        <ul className={styles.tagList}>
          {selectedIds.map((id) => (
            <li key={id} className={styles.tag}>
              <span className={styles.tagName}>{labelByValue.get(id) ?? id}</span>
              <button
                type="button"
                className={styles.tagRemove}
                disabled={disabled}
                aria-label={`${REMOVE_CATEGORY_LABEL} ${labelByValue.get(id) ?? id}`}
                onClick={() => remove(id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {targets.length > 0 ? (
        <select
          className={styles.select}
          aria-label={label}
          value=""
          disabled={disabled || available.length === 0}
          onChange={(event) => add(event.target.value)}
        >
          <option value="">{placeholderOption}</option>
          {available.map((target) => (
            <option key={target.value} value={target.value}>
              {target.label}
            </option>
          ))}
        </select>
      ) : (
        <p className={styles.emptyText}>{emptyText}</p>
      )}
    </div>
  );
}

/**
 * Inline Link Group editor shown while editing a material. It loads the
 * material's current Siblings on mount, renders them as chips, lets the Admin
 * merge in other materials (multi-select + Link), and remove the material from
 * its group. All grouping logic lives in the Backend Link_Manager; this control
 * only calls the endpoints and reflects the returned Sibling set
 * (linked-material-entitlement Req 2.1–2.8).
 */
function LinkGroupEditor({
  materialId,
  otherMaterials,
  disabled,
  onLoadSiblings,
  onLink,
  onUnlink,
}: LinkGroupEditorProps) {
  const [siblingIds, setSiblingIds] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingLinkId, setPendingLinkId] = useState('');

  const titleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const material of otherMaterials) {
      map.set(material.id, material.title);
    }
    return map;
  }, [otherMaterials]);

  const load = useCallback(async () => {
    setLoading(true);
    const ids = await onLoadSiblings(materialId);
    setSiblingIds(ids ?? []);
    setLoading(false);
  }, [materialId, onLoadSiblings]);

  useEffect(() => {
    void load();
  }, [load]);

  // Collapse other materials into link targets (grouped ones show once), then
  // drop any target the subject is already linked to (a member is a sibling) —
  // that group is already shown in the sibling chips above.
  const linkableTargets = useMemo(() => {
    const siblingSet = new Set(siblingIds ?? []);
    return collapseToLinkTargets(otherMaterials).filter(
      (target) => !target.memberIds.some((id) => siblingSet.has(id)),
    );
  }, [otherMaterials, siblingIds]);

  const handleLink = async (): Promise<void> => {
    if (pendingLinkId.length === 0) {
      return;
    }
    const changed = await onLink(materialId, [pendingLinkId]);
    if (changed !== null) {
      setPendingLinkId('');
      await load();
    }
  };

  const handleUnlink = async (): Promise<void> => {
    const changed = await onUnlink(materialId);
    if (changed !== null) {
      await load();
    }
  };

  const hasSiblings = (siblingIds?.length ?? 0) > 0;

  return (
    <div className={styles.categoryPicker}>
      <p className={styles.fieldGroupLabel}>{LINKED_MATERIALS_LABEL}</p>
      <p className={styles.categoryHint}>{LINKED_MATERIALS_HINT}</p>

      {loading ? (
        <p className={styles.emptyText}>{LINKED_MATERIALS_LOADING_TEXT}</p>
      ) : hasSiblings ? (
        <>
          <ul className={styles.tagList}>
            {(siblingIds ?? []).map((id) => (
              <li key={id} className={styles.tag}>
                <span className={styles.tagName}>
                  {titleById.get(id) ?? id}
                </span>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={disabled}
              onClick={handleUnlink}
            >
              {UNLINK_LABEL}
            </Button>
          </div>
        </>
      ) : (
        <p className={styles.emptyText}>{LINKED_MATERIALS_EMPTY_TEXT}</p>
      )}

      {linkableTargets.length > 0 ? (
        <div className={styles.inlineForm}>
          <select
            className={`${styles.select} ${styles.grow}`}
            aria-label={LINK_MATERIALS_LABEL}
            value={pendingLinkId}
            disabled={disabled}
            onChange={(event) => setPendingLinkId(event.target.value)}
          >
            <option value="">{LINK_MATERIALS_PLACEHOLDER_OPTION}</option>
            {linkableTargets.map((target) => (
              <option key={target.value} value={target.value}>
                {target.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="secondary"
            disabled={disabled || pendingLinkId.length === 0}
            onClick={handleLink}
          >
            {LINK_SUBMIT_LABEL}
          </Button>
        </div>
      ) : (
        <p className={styles.emptyText}>{NO_OTHER_MATERIALS_TEXT}</p>
      )}
    </div>
  );
}

/**
 * Inline files editor shown while editing a material. The public catalog
 * (`GET /api/catalog`) omits a material's files, so this control loads the
 * current file list on mount from `GET /api/materials/:id` (an Admin's
 * `role_admin` token bypasses the Paid-Material entitlement gate, so the files
 * are returned for both Free and Paid Materials). It lists each file with a
 * Remove action and offers a multi-file input to add more; after a successful
 * add/remove it reloads the list from the same source (Req 11.1, 11.3).
 */
function MaterialFilesEditor({
  materialId,
  authToken,
  disabled,
  onAddFiles,
  onRemoveFile,
}: MaterialFilesEditorProps) {
  const [files, setFiles] = useState<AdminMaterialFile[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [chosenFiles, setChosenFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (authToken !== null) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    const result = await httpRequest<MaterialDetail>(
      buildApiUrl(`${API_ROUTES.material}/${encodeURIComponent(materialId)}`),
      { headers, suppressErrorToast: true },
    );
    if (result.ok) {
      setFiles(result.data.files ?? []);
    } else {
      setFiles(null);
      setLoadFailed(true);
    }
    setLoading(false);
  }, [materialId, authToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAdd = async (): Promise<void> => {
    if (chosenFiles.length === 0) {
      return;
    }
    const succeeded = await onAddFiles(materialId, chosenFiles);
    if (succeeded) {
      setChosenFiles([]);
      setFileInputKey((key) => key + 1);
      await load();
    }
  };

  const handleRemove = async (fileId: string): Promise<void> => {
    const succeeded = await onRemoveFile(materialId, fileId);
    if (succeeded) {
      await load();
    }
  };

  return (
    <div className={styles.categoryPicker}>
      <p className={styles.fieldGroupLabel}>{FILES_LABEL}</p>
      <p className={styles.categoryHint}>{FILES_HINT}</p>

      {loading ? (
        <p className={styles.emptyText}>{FILES_LOADING_TEXT}</p>
      ) : loadFailed ? (
        <p className={styles.emptyText}>{FILES_ERROR_TEXT}</p>
      ) : (files?.length ?? 0) > 0 ? (
        <ul className={styles.tagList}>
          {(files ?? []).map((file) => (
            <li key={file.id} className={styles.tag}>
              <span className={styles.tagName}>{file.fileName}</span>
              <button
                type="button"
                className={styles.tagRemove}
                disabled={disabled}
                aria-label={`${REMOVE_FILE_LABEL} ${file.fileName}`}
                onClick={() => handleRemove(file.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptyText}>{FILES_EMPTY_TEXT}</p>
      )}

      <div className={styles.inlineForm}>
        <input
          key={fileInputKey}
          id={ADD_FILES_INPUT_ID}
          className={`${styles.fileInput} ${styles.grow}`}
          type="file"
          multiple
          disabled={disabled}
          aria-label={ADD_FILES_LABEL}
          onChange={(event) =>
            setChosenFiles(Array.from(event.target.files ?? []))
          }
        />
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || chosenFiles.length === 0}
          onClick={handleAdd}
        >
          {ADD_FILES_LABEL}
        </Button>
      </div>
    </div>
  );
}

function StudyMaterialTab() {
  const router = useRouter();
  const {
    isAdmin,
    isLoading: isActing,
    logout,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    addMaterialFiles,
    removeMaterialFile,
    getLinkGroup,
    linkMaterials,
    unlinkMaterial,
  } = useAdminMaterials();
  // The Access Token is used to fetch a material's current file list in the
  // edit view (an Admin's `role_admin` token bypasses the entitlement gate on
  // `GET /api/materials/:id`, so files are returned for Free and Paid alike).
  const { token } = useAccessToken();

  // Gate rendering until after mount so the token re-synced from storage is
  // reflected before deciding whether to redirect an unauthenticated visitor.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !isAdmin) {
      router.replace(ADMIN_LOGIN_PATH);
    }
  }, [hasMounted, isAdmin, router]);

  // Catalog data for display, reloaded after each successful mutation.
  const [catalog, setCatalog] = useState<DashboardCatalog | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<HttpError | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const reloadCatalog = useCallback(() => {
    setReloadNonce((nonce) => nonce + 1);
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      return undefined;
    }
    const controller = new AbortController();
    let active = true;
    setCatalogLoading(true);
    setCatalogError(null);
    httpRequest<DashboardCatalog>(buildApiUrl(API_ROUTES.catalog), {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    }).then((result) => {
      if (!active) {
        return;
      }
      if (result.ok) {
        setCatalog(result.data);
        setCatalogError(null);
      } else {
        setCatalogError(result.error);
      }
      setCatalogLoading(false);
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [isAdmin, reloadNonce]);

  const [feedback, setFeedback] = useState<DashboardFeedback | null>(null);

  /**
   * Run a Content Management Action, surfacing a success/error banner and
   * reloading the catalog on success. Returns whether the action succeeded so
   * callers can reset their local form state.
   */
  const runAction = useCallback(
    async (
      action: () => Promise<HttpResult<unknown>>,
      successMessage: string,
    ): Promise<boolean> => {
      setFeedback(null);
      const result = await action();
      if (result.ok) {
        setFeedback({ kind: 'success', message: successMessage });
        reloadCatalog();
        return true;
      }
      setFeedback({
        kind: 'error',
        message: result.error.message || GENERIC_ACTION_ERROR,
      });
      return false;
    },
    [reloadCatalog],
  );

  const existingCategoryNames = useMemo(
    () =>
      catalog
        ? collectCategoryNamesForType(catalog, GENERAL_CATEGORY_TYPE_NAME)
        : [],
    [catalog],
  );
  const existingSubjectNames = useMemo(
    () =>
      catalog
        ? collectCategoryNamesForType(catalog, SUBJECT_CATEGORY_TYPE_NAME)
        : [],
    [catalog],
  );
  const existingJobNames = useMemo(
    () =>
      catalog ? collectCategoryNamesForType(catalog, JOB_CATEGORY_TYPE_NAME) : [],
    [catalog],
  );

  // ---- Upload form state (Req 11.1) --------------------------------------
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadPrice, setUploadPrice] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState('');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [jobInput, setJobInput] = useState('');
  const [selectedLinkedIds, setSelectedLinkedIds] = useState<string[]>([]);
  const [uploadErrors, setUploadErrors] = useState<{
    title?: string;
    file?: string;
    price?: string;
  }>({});
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleUpload = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const nextErrors: { title?: string; file?: string; price?: string } = {};
    if (uploadTitle.trim().length === 0) {
      nextErrors.title = TITLE_REQUIRED_ERROR;
    }
    if (uploadFiles.length === 0) {
      nextErrors.file = FILE_REQUIRED_ERROR;
    }
    const parsedPrice = parsePriceInput(uploadPrice);
    if (!parsedPrice.ok) {
      nextErrors.price = PRICE_INVALID_ERROR;
    }
    if (
      nextErrors.title ||
      nextErrors.file ||
      nextErrors.price ||
      uploadFiles.length === 0 ||
      !parsedPrice.ok
    ) {
      setUploadErrors(nextErrors);
      return;
    }
    setUploadErrors({});
    const description = uploadDescription.trim();
    // A positive amount marks the material Paid and carries the Currency (INR);
    // a null amount (empty/0) leaves it Free and omits the Price (Req 11.13,
    // 11.14). The Backend API re-validates the Price (Req 11.15).
    const isPaid = parsedPrice.amount !== null;
    const succeeded = await runAction(
      () =>
        createMaterial({
          title: uploadTitle.trim(),
          description: description.length > 0 ? description : undefined,
          files: uploadFiles,
          priceAmount: parsedPrice.amount,
          currency: isPaid ? DEFAULT_CURRENCY : undefined,
          categories: selectedCategories,
          subjects: selectedSubjects,
          jobs: selectedJobs,
          linkedMaterialIds: selectedLinkedIds,
        }),
      UPLOAD_SUCCESS_MESSAGE,
    );
    if (succeeded) {
      setUploadTitle('');
      setUploadDescription('');
      setUploadPrice('');
      setUploadFiles([]);
      setSelectedCategories([]);
      setCategoryInput('');
      setSelectedSubjects([]);
      setSubjectInput('');
      setSelectedJobs([]);
      setJobInput('');
      setSelectedLinkedIds([]);
      setFileInputKey((key) => key + 1);
    }
  };

  // ---- Material edit state (Req 11.5) ------------------------------------
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<MaterialEditDraft>({
    title: '',
    description: '',
    price: '',
  });
  const [editPriceError, setEditPriceError] = useState<string | undefined>(
    undefined,
  );

  const beginEdit = (material: DashboardMaterial): void => {
    setEditingMaterialId(material.id);
    setEditPriceError(undefined);
    setEditDraft({
      title: material.title,
      description: material.description ?? '',
      price: priceToDraft(material.priceAmount),
    });
  };

  const cancelEdit = (): void => {
    setEditingMaterialId(null);
    setEditPriceError(undefined);
    setEditDraft({ title: '', description: '', price: '' });
  };

  const saveEdit = async (materialId: string): Promise<void> => {
    const parsedPrice = parsePriceInput(editDraft.price);
    if (!parsedPrice.ok) {
      setEditPriceError(PRICE_INVALID_ERROR);
      return;
    }
    setEditPriceError(undefined);
    // Always send the Price on edit so clearing it (empty/0) resets the
    // material to Free; a positive amount carries the Currency (INR)
    // (Req 11.13, 11.14). The Backend API re-validates the Price (Req 11.15).
    const isPaid = parsedPrice.amount !== null;
    const succeeded = await runAction(
      () =>
        updateMaterial(materialId, {
          title: editDraft.title.trim(),
          description: editDraft.description.trim(),
          priceAmount: parsedPrice.amount,
          currency: isPaid ? DEFAULT_CURRENCY : undefined,
        }),
      UPDATE_SUCCESS_MESSAGE,
    );
    if (succeeded) {
      cancelEdit();
    }
  };

  // ---- Link Group handlers (linked-material-entitlement Req 2.1–2.8) ------

  /** Load a material's current Sibling ids; returns null on failure. */
  const loadSiblings = useCallback(
    async (materialId: string): Promise<string[] | null> => {
      const result = await getLinkGroup(materialId);
      if (result.ok) {
        return result.data.siblingIds;
      }
      setFeedback({
        kind: 'error',
        message: result.error.message || GENERIC_ACTION_ERROR,
      });
      return null;
    },
    [getLinkGroup],
  );

  /**
   * Link the subject with the given materials. Surfaces a success (or "no
   * change") banner and reloads the catalog so the listing reflects the new
   * Effective Entitlement. Returns whether membership changed, or null on error.
   */
  const linkSubject = useCallback(
    async (materialId: string, materialIds: string[]): Promise<boolean | null> => {
      setFeedback(null);
      const result = await linkMaterials(materialId, materialIds);
      if (!result.ok) {
        setFeedback({
          kind: 'error',
          message: result.error.message || GENERIC_ACTION_ERROR,
        });
        return null;
      }
      setFeedback({
        kind: 'success',
        message: result.data.changed ? LINK_SUCCESS_MESSAGE : LINK_NO_CHANGE_MESSAGE,
      });
      reloadCatalog();
      return result.data.changed;
    },
    [linkMaterials, reloadCatalog],
  );

  /** Remove the subject from its Link Group. Returns whether it changed, or null on error. */
  const unlinkSubject = useCallback(
    async (materialId: string): Promise<boolean | null> => {
      setFeedback(null);
      const result = await unlinkMaterial(materialId);
      if (!result.ok) {
        setFeedback({
          kind: 'error',
          message: result.error.message || GENERIC_ACTION_ERROR,
        });
        return null;
      }
      setFeedback({
        kind: 'success',
        message: result.data.changed
          ? UNLINK_SUCCESS_MESSAGE
          : UNLINK_NO_CHANGE_MESSAGE,
      });
      reloadCatalog();
      return result.data.changed;
    },
    [unlinkMaterial, reloadCatalog],
  );

  // ---- Files handlers (Req 11.1, 11.3) -----------------------------------
  // Both reuse the shared runAction pipeline (feedback banner + catalog reload)
  // and return whether the action succeeded so the files editor can reload its
  // list from `GET /api/materials/:id`.

  const addFilesToMaterial = useCallback(
    (materialId: string, files: File[]): Promise<boolean> =>
      runAction(() => addMaterialFiles(materialId, files), FILE_ADDED_MESSAGE),
    [runAction, addMaterialFiles],
  );

  const removeFileFromMaterial = useCallback(
    (materialId: string, fileId: string): Promise<boolean> =>
      runAction(
        () => removeMaterialFile(materialId, fileId),
        FILE_REMOVED_MESSAGE,
      ),
    [runAction, removeMaterialFile],
  );

  /** All existing materials as options (upload-time link targets, group-aware). */
  const allMaterialOptions = useMemo<MaterialOption[]>(
    () =>
      (catalog?.materials ?? []).map((material) => ({
        id: material.id,
        title: material.title,
        linkGroupId: material.linkGroupId ?? null,
      })),
    [catalog],
  );

  /** All materials except the given subject, as options for linking (group-aware). */
  const otherMaterialsFor = useCallback(
    (subjectId: string): MaterialOption[] =>
      (catalog?.materials ?? [])
        .filter((material) => material.id !== subjectId)
        .map((material) => ({
          id: material.id,
          title: material.title,
          linkGroupId: material.linkGroupId ?? null,
        })),
    [catalog],
  );

  const handleLogout = (): void => {
    logout();
    router.replace(ADMIN_LOGIN_PATH);
  };

  // Render a loading state until mounted and confirmed admin to avoid flashing
  // the dashboard before the redirect decision is settled.
  if (!hasMounted || !isAdmin) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <LoadingIndicator fullPanel />
        </div>
      </main>
    );
  }

  const feedbackClassName =
    feedback?.kind === 'success'
      ? `${styles.feedback} ${styles.feedbackSuccess}`
      : `${styles.feedback} ${styles.feedbackError}`;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>{DASHBOARD_TITLE}</h1>
            <p className={styles.subtitle}>{DASHBOARD_SUBTITLE}</p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            {LOGOUT_LABEL}
          </Button>
        </header>

        {feedback && (
          <p className={feedbackClassName} role="status">
            {feedback.message}
          </p>
        )}

        {/* Upload section (Req 11.1) */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{UPLOAD_SECTION_TITLE}</h2>
          <form className={styles.form} onSubmit={handleUpload} noValidate>
            <Input
              id={MATERIAL_TITLE_FIELD_ID}
              label={MATERIAL_TITLE_LABEL}
              value={uploadTitle}
              placeholder={MATERIAL_TITLE_PLACEHOLDER}
              error={uploadErrors.title}
              disabled={isActing}
              onChange={(event) => {
                setUploadTitle(event.target.value);
                if (uploadErrors.title) {
                  setUploadErrors((prev) => ({ ...prev, title: undefined }));
                }
              }}
            />
            <Input
              id={MATERIAL_DESCRIPTION_FIELD_ID}
              label={MATERIAL_DESCRIPTION_LABEL}
              value={uploadDescription}
              placeholder={MATERIAL_DESCRIPTION_PLACEHOLDER}
              disabled={isActing}
              onChange={(event) => setUploadDescription(event.target.value)}
            />
            <Input
              id={MATERIAL_PRICE_FIELD_ID}
              label={MATERIAL_PRICE_LABEL}
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_PAID_AMOUNT}
              step={1}
              value={uploadPrice}
              placeholder={MATERIAL_PRICE_PLACEHOLDER}
              hint={MATERIAL_PRICE_HINT}
              error={uploadErrors.price}
              disabled={isActing}
              onChange={(event) => {
                setUploadPrice(event.target.value);
                if (uploadErrors.price) {
                  setUploadErrors((prev) => ({ ...prev, price: undefined }));
                }
              }}
            />

            {/* Categories / Subjects / Jobs — pick existing or type new to be
                auto-created on upload (Req 0.1, 2.2). */}
            <CategoryPicker
              label={CATEGORIES_LABEL}
              hint={CATEGORIES_HINT}
              inputId={NEW_CATEGORY_INPUT_ID}
              placeholder={NEW_CATEGORY_INPUT_PLACEHOLDER}
              emptyText={NO_EXISTING_CATEGORIES_TEXT}
              existingNames={existingCategoryNames}
              selected={selectedCategories}
              onSelectedChange={setSelectedCategories}
              inputValue={categoryInput}
              onInputChange={setCategoryInput}
              disabled={isActing}
            />
            <CategoryPicker
              label={SUBJECTS_LABEL}
              hint={SUBJECTS_HINT}
              inputId={NEW_SUBJECT_INPUT_ID}
              placeholder={NEW_SUBJECT_INPUT_PLACEHOLDER}
              emptyText={NO_EXISTING_SUBJECTS_TEXT}
              existingNames={existingSubjectNames}
              selected={selectedSubjects}
              onSelectedChange={setSelectedSubjects}
              inputValue={subjectInput}
              onInputChange={setSubjectInput}
              disabled={isActing}
            />
            <CategoryPicker
              label={JOBS_LABEL}
              hint={JOBS_HINT}
              inputId={NEW_JOB_INPUT_ID}
              placeholder={NEW_JOB_INPUT_PLACEHOLDER}
              emptyText={NO_EXISTING_JOBS_TEXT}
              existingNames={existingJobNames}
              selected={selectedJobs}
              onSelectedChange={setSelectedJobs}
              inputValue={jobInput}
              onInputChange={setJobInput}
              disabled={isActing}
            />

            {/* Optionally link the new material with existing ones on creation
                so buying any member unlocks them all (Req 1.1–1.4). */}
            <MaterialMultiPicker
              label={UPLOAD_LINK_LABEL}
              hint={UPLOAD_LINK_HINT}
              placeholderOption={UPLOAD_LINK_PLACEHOLDER_OPTION}
              emptyText={UPLOAD_LINK_EMPTY_TEXT}
              options={allMaterialOptions}
              selectedIds={selectedLinkedIds}
              onSelectedChange={setSelectedLinkedIds}
              disabled={isActing}
            />

            <div className={styles.fileField}>
              <label className={styles.fileLabel} htmlFor={MATERIAL_FILE_FIELD_ID}>
                {MATERIAL_FILE_LABEL}
              </label>
              <p className={styles.categoryHint}>{MATERIAL_FILE_HINT}</p>
              <input
                key={fileInputKey}
                id={MATERIAL_FILE_FIELD_ID}
                className={styles.fileInput}
                type="file"
                multiple
                disabled={isActing}
                onChange={(event) => {
                  setUploadFiles(Array.from(event.target.files ?? []));
                  if (uploadErrors.file) {
                    setUploadErrors((prev) => ({ ...prev, file: undefined }));
                  }
                }}
              />
              {uploadErrors.file && (
                <p className={styles.fieldError}>{uploadErrors.file}</p>
              )}
            </div>
            <div className={styles.actions}>
              <Button type="submit" variant="primary" isLoading={isActing}>
                {UPLOAD_SUBMIT_LABEL}
              </Button>
            </div>
          </form>
        </section>

        {/* Study materials management (Req 11.3, 11.5) */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{MATERIALS_SECTION_TITLE}</h2>

          {catalogError && (
            <ErrorMessage
              title={CATALOG_ERROR_TITLE}
              message={CATALOG_ERROR_MESSAGE}
              retryLabel={RETRY_LABEL}
              onRetry={reloadCatalog}
            />
          )}

          {catalogLoading && catalog === null && <LoadingIndicator />}

          {catalog !== null && catalog.materials.length === 0 && (
            <EmptyState message={MATERIALS_EMPTY_MESSAGE} />
          )}

          {catalog !== null && catalog.materials.length > 0 && (
            <ul className={styles.materialList}>
              {catalog.materials.map((material) => {
                const isEditing = editingMaterialId === material.id;

                return (
                  <li key={material.id} className={styles.materialItem}>
                    {isEditing ? (
                      <div className={styles.form}>
                        <Input
                          id={`edit-title-${material.id}`}
                          label={MATERIAL_TITLE_LABEL}
                          value={editDraft.title}
                          disabled={isActing}
                          onChange={(event) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              title: event.target.value,
                            }))
                          }
                        />
                        <Input
                          id={`edit-description-${material.id}`}
                          label={MATERIAL_DESCRIPTION_LABEL}
                          value={editDraft.description}
                          disabled={isActing}
                          onChange={(event) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              description: event.target.value,
                            }))
                          }
                        />
                        <Input
                          id={`edit-price-${material.id}`}
                          label={MATERIAL_PRICE_LABEL}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={MAX_PAID_AMOUNT}
                          step={1}
                          value={editDraft.price}
                          placeholder={MATERIAL_PRICE_PLACEHOLDER}
                          hint={MATERIAL_PRICE_HINT}
                          error={editPriceError}
                          disabled={isActing}
                          onChange={(event) => {
                            const { value } = event.target;
                            setEditDraft((prev) => ({ ...prev, price: value }));
                            if (editPriceError) {
                              setEditPriceError(undefined);
                            }
                          }}
                        />
                        <LinkGroupEditor
                          materialId={material.id}
                          otherMaterials={otherMaterialsFor(material.id)}
                          disabled={isActing}
                          onLoadSiblings={loadSiblings}
                          onLink={linkSubject}
                          onUnlink={unlinkSubject}
                        />
                        <MaterialFilesEditor
                          materialId={material.id}
                          authToken={token}
                          disabled={isActing}
                          onAddFiles={addFilesToMaterial}
                          onRemoveFile={removeFileFromMaterial}
                        />
                        <div className={styles.actions}>
                          <Button
                            variant="primary"
                            isLoading={isActing}
                            onClick={() => saveEdit(material.id)}
                          >
                            {SAVE_LABEL}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={cancelEdit}
                            disabled={isActing}
                          >
                            {CANCEL_LABEL}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.itemHeader}>
                          <h3 className={styles.itemName}>{material.title}</h3>
                          <div className={styles.actions}>
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={isActing}
                              onClick={() => beginEdit(material)}
                            >
                              {EDIT_LABEL}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={isActing}
                              onClick={() =>
                                runAction(
                                  () => deleteMaterial(material.id),
                                  DELETE_SUCCESS_MESSAGE,
                                )
                              }
                            >
                              {DELETE_LABEL}
                            </Button>
                          </div>
                        </div>
                        {material.description && (
                          <p className={styles.itemDescription}>
                            {material.description}
                          </p>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default StudyMaterialTab;
