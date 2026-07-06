// Constant values for the admin dashboard page (Requirements 1.16, 10.5, 11.1,
// 11.5, 11.16).
//
// Centralizes the route paths, copy, and field identifiers used by the content
// management UI so the page module holds no constant-literal exports
// (Req 1.16, 1.17), including the optional Price field an Admin may set on
// upload/edit (Req 11.13–11.16).

/**
 * Route the page redirects to when the visitor is not a signed-in admin. There
 * is no separate admin login — admin access comes from the account token's
 * `role_admin`, so a non-admin is sent to the account page to sign in.
 */
export const ADMIN_LOGIN_PATH = '/account';

/** Page heading and supporting copy. */
export const DASHBOARD_TITLE = 'Content management';
export const DASHBOARD_SUBTITLE =
  'Upload, edit, and organize study materials and their categories.';
export const LOGOUT_LABEL = 'Log out';

/** Section headings. */
export const UPLOAD_SECTION_TITLE = 'Upload study material';
export const MATERIALS_SECTION_TITLE = 'Study materials';

/**
 * Category Type names the picker groups classifications under. Categories are a
 * flat list under the default ("General") type; Subjects and Jobs are their own
 * dimensions. These must match the Backend Category Type names.
 */
export const GENERAL_CATEGORY_TYPE_NAME = 'General';
export const SUBJECT_CATEGORY_TYPE_NAME = 'Subject';
export const JOB_CATEGORY_TYPE_NAME = 'Job';

/** Category picker copy for the upload form. */
export const CATEGORIES_LABEL = 'Categories';
export const CATEGORIES_HINT =
  'Select existing categories, or type a new one and add it — new categories are created automatically.';
export const NEW_CATEGORY_INPUT_ID = 'material-new-category';
export const NEW_CATEGORY_INPUT_PLACEHOLDER = 'e.g. Mathematics';

/** Subject picker copy for the upload form. */
export const SUBJECTS_LABEL = 'Subjects';
export const SUBJECTS_HINT =
  'Select existing subjects, or type a new one and add it — new subjects are created automatically.';
export const NEW_SUBJECT_INPUT_ID = 'material-new-subject';
export const NEW_SUBJECT_INPUT_PLACEHOLDER = 'e.g. Physics';
export const NO_EXISTING_SUBJECTS_TEXT =
  'No subjects yet. Type one above to create the first.';

/** Job picker copy for the upload form. */
export const JOBS_LABEL = 'Jobs';
export const JOBS_HINT =
  'Select existing jobs, or type a new one and add it — new jobs are created automatically.';
export const NEW_JOB_INPUT_ID = 'material-new-job';
export const NEW_JOB_INPUT_PLACEHOLDER = 'e.g. Data Analyst';
export const NO_EXISTING_JOBS_TEXT =
  'No jobs yet. Type one above to create the first.';

export const ADD_CATEGORY_LABEL = 'Add';
export const REMOVE_CATEGORY_LABEL = 'Remove';
export const NO_EXISTING_CATEGORIES_TEXT =
  'No categories yet. Type one above to create the first.';

/** Upload / material form field identifiers and copy (Req 11.1, 11.5). */
export const MATERIAL_TITLE_FIELD_ID = 'material-title';
export const MATERIAL_TITLE_LABEL = 'Title';
export const MATERIAL_TITLE_PLACEHOLDER = 'e.g. Algebra Notes';
export const MATERIAL_DESCRIPTION_FIELD_ID = 'material-description';
export const MATERIAL_DESCRIPTION_LABEL = 'Description';
export const MATERIAL_DESCRIPTION_PLACEHOLDER = 'Optional summary of the material';
export const MATERIAL_FILE_FIELD_ID = 'material-file';
export const MATERIAL_FILE_LABEL = 'File';

/**
 * Price field copy (Req 11.13–11.15). The Currency is fixed to INR for this
 * iteration; an empty amount or 0 marks the material Free, a positive amount
 * (up to 1,000,000) marks it Paid. The Backend API re-validates every Price
 * (Req 11.15).
 */
export const MATERIAL_PRICE_FIELD_ID = 'material-price';
export const MATERIAL_PRICE_LABEL = 'Price (INR)';
export const MATERIAL_PRICE_PLACEHOLDER = 'Leave blank for a free material';
export const MATERIAL_PRICE_HINT =
  'Leave blank or 0 for a free material. Whole rupees only, up to 1,000,000.';

/** Action labels. */
export const UPLOAD_SUBMIT_LABEL = 'Upload material';
export const EDIT_LABEL = 'Edit';
export const SAVE_LABEL = 'Save';
export const CANCEL_LABEL = 'Cancel';
export const DELETE_LABEL = 'Delete';
export const ADD_LABEL = 'Add';
export const RENAME_LABEL = 'Rename';
export const REMOVE_TAG_LABEL = 'Remove';
export const ASSIGN_TAG_LABEL = 'Add tag';

/** Category management copy (Req 11.7). */
export const NEW_CATEGORY_TYPE_FIELD_ID = 'new-category-type';
export const NEW_CATEGORY_TYPE_LABEL = 'New category type name';
export const NEW_CATEGORY_TYPE_PLACEHOLDER = 'e.g. Subject';
export const NEW_CATEGORY_LABEL = 'New category name';
export const NEW_CATEGORY_PLACEHOLDER = 'e.g. Mathematics';

/** Tag assignment copy (Req 2.2, 2.3). */
export const TAGS_LABEL = 'Tags';
export const NO_TAGS_TEXT = 'No tags assigned.';
export const ASSIGN_TAG_SELECT_LABEL = 'Select a category to tag';
export const ASSIGN_TAG_PLACEHOLDER_OPTION = 'Select a category…';

/** Empty / loading / error copy. */
export const MATERIALS_EMPTY_MESSAGE =
  'No study materials yet. Upload one above to get started.';
export const CATEGORY_TYPES_EMPTY_MESSAGE =
  'No category types yet. Add one below to start organizing materials.';
export const CATALOG_ERROR_TITLE = 'Could not load content';
export const CATALOG_ERROR_MESSAGE =
  'The catalog could not be loaded. Please try again.';
export const RETRY_LABEL = 'Try again';

/** Feedback banner copy. */
export const GENERIC_ACTION_ERROR =
  'The action could not be completed. Please try again.';
export const UPLOAD_SUCCESS_MESSAGE = 'Study material uploaded.';
export const UPDATE_SUCCESS_MESSAGE = 'Study material updated.';
export const DELETE_SUCCESS_MESSAGE = 'Study material deleted.';
export const TAG_ASSIGNED_MESSAGE = 'Tag added.';
export const TAG_REMOVED_MESSAGE = 'Tag removed.';
export const CATEGORY_TYPE_CREATED_MESSAGE = 'Category type added.';
export const CATEGORY_TYPE_RENAMED_MESSAGE = 'Category type renamed.';
export const CATEGORY_TYPE_DELETED_MESSAGE = 'Category type deleted.';
export const CATEGORY_CREATED_MESSAGE = 'Category added.';
export const CATEGORY_RENAMED_MESSAGE = 'Category renamed.';
export const CATEGORY_DELETED_MESSAGE = 'Category deleted.';

/** Client-side validation copy mirroring Backend bounds (Req 11.2, 11.6). */
export const TITLE_REQUIRED_ERROR = 'Enter a title.';
export const FILE_REQUIRED_ERROR = 'Choose a file to upload.';
export const NAME_REQUIRED_ERROR = 'Enter a name.';
export const PRICE_INVALID_ERROR =
  'Enter a whole number between 0 and 1,000,000, or leave blank for free.';
