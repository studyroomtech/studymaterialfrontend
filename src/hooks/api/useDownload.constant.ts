// Constants for the `useDownload` orchestration hook (Req 6.7, 6.8).

// HTTP status returned by `POST /api/materials/:id/download` when the presented
// Access Token is missing, expired, or invalid. It causes the hook to clear the
// stored token and re-open the Download Gate to re-collect name + email before
// the download proceeds (Req 6.7).
export const DOWNLOAD_UNAUTHORIZED_STATUS = 401;

// Backend error `code` returned by `POST /api/downloads/gate` when the submitted
// email resolves to a Password-Protected Account and a correct password was not
// supplied. It causes the gate to reveal a password field and prompt the
// Learner to enter their password instead of treating it as a generic failure.
export const GATE_PASSWORD_REQUIRED_CODE = 'PASSWORD_REQUIRED';
